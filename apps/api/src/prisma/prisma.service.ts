import { INestApplication, Injectable, Logger, OnModuleInit } from "@nestjs/common";

const DELEGATE_METHODS = [
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "upsert",
  "update",
  "updateMany",
  "create",
  "createMany",
  "delete",
  "deleteMany",
  "aggregate"
] as const;

type DelegateMethod = (...args: unknown[]) => Promise<any>;

type Delegate = Record<(typeof DELEGATE_METHODS)[number], DelegateMethod>;

function createDelegate(model: string): Delegate {
  return Object.fromEntries(
    DELEGATE_METHODS.map((method) => [
      method,
      async () => {
        throw new Error(`Prisma model "${model}" method "${method}" is not available in the offline stub.`);
      }
    ])
  ) as unknown as Delegate;
}

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  user: any = createDelegate("user");
  classroom: any = createDelegate("classroom");
  classMember: any = createDelegate("classMember");
  assignment: any = createDelegate("assignment");
  submission: any = createDelegate("submission");
  workerJob: any = createDelegate("workerJob");
  refreshToken: any = createDelegate("refreshToken");
  registration: any = createDelegate("registration");
  grade: any = createDelegate("grade");
  rubric: any = createDelegate("rubric");
  rubricCriteria: any = createDelegate("rubricCriteria");
  announcement: any = createDelegate("announcement");
  fileAsset: any = createDelegate("fileAsset");

  async onModuleInit() {
    this.logger.warn("PrismaService initialized without database connectivity (stub mode).");
  }

  async enableShutdownHooks(app: INestApplication) {
    this.logger.debug(`Shutdown hooks are no-ops in stub mode for ${app.constructor.name}`);
  }

  async $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    return fn(this);
  }

  $on() {
    // No-op placeholder to mirror PrismaClient API
  }
}
