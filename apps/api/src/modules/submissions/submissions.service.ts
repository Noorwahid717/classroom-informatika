import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSubmissionDto } from "./dto/create-submission.dto";
import { UpdateSubmissionDto } from "./dto/update-submission.dto";
import { Role, SubmissionStatus } from "@prisma/client";

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  listByAssignment(assignmentId: string, user: { sub: string; role: Role }) {
    const where =
      user.role === "STUDENT"
        ? { assignmentId, studentId: user.sub }
        : { assignmentId };
    return this.prisma.submission.findMany({ where, include: { student: true, grade: true } });
  }

  async getById(id: string, user: { sub: string; role: Role }) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { student: true, grade: true, assignment: { include: { classroom: true } } }
    });
    if (!submission) {
      throw new NotFoundException("Submission tidak ditemukan");
    }
    if (user.role === "STUDENT" && submission.studentId !== user.sub) {
      throw new ForbiddenException("Tidak memiliki akses ke submission ini");
    }
    return submission;
  }

  async create(user: { sub: string; role: Role }, dto: CreateSubmissionDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: dto.assignmentId },
      select: { id: true, classId: true }
    });
    if (!assignment) {
      throw new NotFoundException("Tugas tidak ditemukan");
    }
    if (user.role === "STUDENT") {
      const isMember = await this.prisma.classMember.count({
        where: { classId: assignment.classId, userId: user.sub }
      });
      if (!isMember) {
        throw new ForbiddenException("Tidak terdaftar pada kelas ini");
      }
    }
    return this.prisma.submission.create({
      data: {
        assignmentId: dto.assignmentId,
        studentId: user.sub,
        repositoryUrl: dto.repositoryUrl,
        previewUrl: dto.previewUrl ?? null,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date()
      }
    });
  }

  async update(id: string, user: { sub: string; role: Role }, dto: UpdateSubmissionDto) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      throw new NotFoundException("Submission tidak ditemukan");
    }
    const isOwner = submission.studentId === user.sub;
    if (user.role === "STUDENT" && !isOwner) {
      throw new ForbiddenException("Tidak dapat mengubah submission orang lain");
    }
    if (user.role === "STUDENT" && dto.status && dto.status !== SubmissionStatus.SUBMITTED) {
      throw new ForbiddenException("Status hanya dapat diubah oleh mentor/admin");
    }

    const data: Record<string, unknown> = {};
    if (dto.repositoryUrl) {
      data.repositoryUrl = dto.repositoryUrl;
      data.status = SubmissionStatus.SUBMITTED;
      data.submittedAt = new Date();
    }
    if (dto.previewUrl !== undefined) {
      data.previewUrl = dto.previewUrl;
    }
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === SubmissionStatus.GRADED) {
        data.gradedAt = new Date();
      }
    }
    return this.prisma.submission.update({ where: { id }, data });
  }

  async remove(id: string, user: { sub: string; role: Role }) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      throw new NotFoundException("Submission tidak ditemukan");
    }
    const isOwner = submission.studentId === user.sub;
    if (user.role === "STUDENT" && !isOwner) {
      throw new ForbiddenException("Tidak dapat menghapus submission orang lain");
    }
    if (user.role === "STUDENT" && submission.status === SubmissionStatus.GRADED) {
      throw new BadRequestException("Submission yang sudah dinilai tidak dapat dihapus");
    }
    await this.prisma.submission.delete({ where: { id } });
    return { id };
  }
}
