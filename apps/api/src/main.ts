import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import helmet from "fastify-helmet";
import rateLimit from "fastify-rate-limit";
import multipart from "@fastify/multipart";
import { AppModule } from "./app.module";
import { env } from "@classroom/config/env";
import { instrumentNestJS, setupOpenTelemetry } from "./observability";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));

  await app.register(helmet, {
    contentSecurityPolicy: false
  });
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute"
  });

  await app.register(multipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 30 * 1024 * 1024
    }
  });

  app.enableCors({
    origin: env.NEXT_PUBLIC_SITE_URL,
    credentials: true,
    allowedHeaders: ["content-type", "authorization", "x-api-key"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  });

  setupOpenTelemetry(app);
  instrumentNestJS(app);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  logger.log(`API running on port ${port}`);
}

void bootstrap();
