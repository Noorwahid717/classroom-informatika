import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertGradeDto } from "./dto/upsert-grade.dto";

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  findBySubmission(submissionId: string) {
    return this.prisma.grade.findUnique({ where: { submissionId }, include: { rubric: { include: { criteria: true } } } });
  }

  upsert(dto: UpsertGradeDto) {
    return this.prisma.grade.upsert({
      where: { submissionId: dto.submissionId },
      update: { score: dto.score, feedback: dto.feedback, rubricSnapshot: dto.rubricSnapshot },
      create: {
        submissionId: dto.submissionId,
        score: dto.score,
        feedback: dto.feedback,
        rubricSnapshot: dto.rubricSnapshot
      }
    });
  }
}
