import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  getSubmission(submissionId: string) {
    return this.prisma.submission.findUniqueOrThrow({ where: { id: submissionId } });
  }

  async completeEvaluation(submissionId: string, lintResult: unknown, score: number) {
    await this.prisma.$transaction(async (tx: PrismaService) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: "GRADED",
          lintReport: lintResult,
          score,
          gradedAt: new Date()
        }
      });
      await tx.workerJob.updateMany({
        where: { submissionId },
        data: { status: "completed", finishedAt: new Date(), result: { score } }
      });
    });
  }

  async markFailed(submissionId: string, error: Error) {
    await this.prisma.workerJob.updateMany({
      where: { submissionId },
      data: { status: "failed", result: { message: error.message, stack: error.stack }, finishedAt: new Date() }
    });
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: "RETURNED" }
    });
  }
}
