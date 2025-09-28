import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { EvaluationProcessor } from "./processors/evaluation.processor";
import { SubmissionService } from "./services/submission.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL ?? "",
        maxRetriesPerRequest: null,
        enableReadyCheck: false
      }
    }),
    BullModule.registerQueue({
      name: "submission-evaluations"
    })
  ],
  providers: [EvaluationProcessor, SubmissionService]
})
export class WorkerModule {}
