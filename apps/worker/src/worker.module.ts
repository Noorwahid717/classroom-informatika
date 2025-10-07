import { BullModule } from "@nestjs/bullmq";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import type { RedisOptions } from "bullmq";
import { PrismaModule } from "./prisma/prisma.module";
import { EvaluationProcessor } from "./processors/evaluation.processor";
import { SubmissionService } from "./services/submission.service";

function resolveRedisConnection(): RedisOptions {
  if (!process.env.REDIS_URL) {
    return { host: "127.0.0.1", port: 6379 };
  }

  const redisUrl = new URL(process.env.REDIS_URL);
  const connection: RedisOptions = {
    host: redisUrl.hostname,
    port: redisUrl.port ? Number(redisUrl.port) : 6379
  };

  if (redisUrl.username) {
    connection.username = redisUrl.username;
  }

  if (redisUrl.password) {
    connection.password = redisUrl.password;
  }

  if (redisUrl.protocol === "rediss:") {
    connection.tls = {};
  }

  return connection;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BullModule.forRoot({
      connection: {
        ...resolveRedisConnection(),
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
