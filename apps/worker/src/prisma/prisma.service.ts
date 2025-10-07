import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

function createDelegate(model: string) {
  return {
    findUniqueOrThrow: async () => {
      throw new Error(`Prisma model "${model}" is not available in stub mode.`);
    },
    update: async () => {
      throw new Error(`Prisma model "${model}" is not available in stub mode.`);
    },
    updateMany: async () => {
      throw new Error(`Prisma model "${model}" is not available in stub mode.`);
    }
  };
}

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  submission: any = createDelegate("submission");
  workerJob: any = createDelegate("workerJob");

  async onModuleInit() {
    this.logger.warn("Worker PrismaService initialized without database access (stub mode).");
  }

  async $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    return fn(this);
  }
}
