import { INestApplication } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { env } from "@classroom/config/env";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

let sdk: NodeSDK | undefined;

export function setupOpenTelemetry(app: INestApplication) {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) return;
  sdk = new NodeSDK({
    serviceName: "classroom-api",
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    instrumentations: [getNodeAutoInstrumentations()]
  });
  void sdk.start();
  app.enableShutdownHooks();
}

export function instrumentNestJS(app: INestApplication) {
  if (!env.SENTRY_DSN) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV
  });
  app.useLogger(console);
}

export async function shutdownObservability() {
  await sdk?.shutdown();
}
