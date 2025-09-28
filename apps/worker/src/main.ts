import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { setupObservability } from "./observability";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, { logger: ['log', 'error', 'warn'] });
  setupObservability();
  console.log("Worker bootstrapped");
  return app;
}

void bootstrap();
