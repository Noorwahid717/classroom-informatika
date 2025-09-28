import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { FastifyFile } from "@fastify/multipart";
import { Role, SubmissionStatus } from "@prisma/client";
import { env } from "@classroom/config/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import JSZip from "jszip";
import path from "node:path";

interface UploadParams {
  submissionId: string;
  user: { sub: string; role: Role };
  file: FastifyFile;
}

@Injectable()
export class FilesService {
  private readonly s3 = new S3Client({
    region: "auto",
    endpoint: `https://${env.STORAGE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.STORAGE_R2_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_R2_SECRET_ACCESS_KEY
    }
  });

  constructor(private readonly prisma: PrismaService) {}

  async uploadSubmissionArchive({ submissionId, user, file }: UploadParams) {
    if (!file) {
      throw new BadRequestException("Berkas tidak ditemukan dalam permintaan");
    }
    if (!file.mimetype?.includes("zip")) {
      throw new BadRequestException("Hanya arsip ZIP yang didukung");
    }
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, studentId: true, assignmentId: true }
    });
    if (!submission) {
      throw new NotFoundException("Submission tidak ditemukan");
    }
    const isOwner = submission.studentId === user.sub;
    if (user.role === "STUDENT" && !isOwner) {
      throw new ForbiddenException("Tidak dapat mengunggah arsip untuk submission ini");
    }

    const buffer = await file.toBuffer();
    if (buffer.byteLength === 0) {
      throw new BadRequestException("Arsip kosong");
    }
    if (buffer.byteLength > 25 * 1024 * 1024) {
      throw new BadRequestException("Arsip melebihi ukuran maksimum 25MB");
    }

    await this.assertSafeArchive(buffer);

    const checksumBase64 = createHash("sha256").update(buffer).digest("base64");
    const sanitizedName = this.normalizeFilename(file.filename ?? "submission.zip");
    const key = `submissions/${submissionId}/${Date.now()}-${sanitizedName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ChecksumSHA256: checksumBase64
      })
    );

    const asset = await this.prisma.$transaction(async (tx) => {
      const createdAsset = await tx.fileAsset.create({
        data: {
          category: "SUBMISSION",
          key,
          bucket: env.STORAGE_R2_BUCKET,
          checksum: checksumBase64,
          size: buffer.byteLength,
          mimeType: file.mimetype,
          uploadedBy: user.sub,
          assignmentId: submission.assignmentId
        }
      });

      await tx.submission.update({
        where: { id: submissionId },
        data: {
          storageKey: key,
          status: SubmissionStatus.PROCESSING
        }
      });

      return createdAsset;
    });

    return {
      key,
      bucket: env.STORAGE_R2_BUCKET,
      checksum: checksumBase64,
      size: buffer.byteLength,
      assetId: asset.id
    };
  }

  private async assertSafeArchive(buffer: Buffer) {
    const zip = await JSZip.loadAsync(buffer, { checkCRC32: true });
    const entries = Object.keys(zip.files);
    if (entries.length === 0) {
      throw new BadRequestException("Arsip tidak boleh kosong");
    }
    for (const name of entries) {
      const normalized = path.posix.normalize(name.replace(/\\\\/g, "/"));
      if (normalized.startsWith("..") || path.posix.isAbsolute(normalized)) {
        throw new BadRequestException("Ditemukan path tidak aman di dalam arsip");
      }
    }
  }

  private normalizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
  }
}
