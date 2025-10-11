declare module '@prisma/client' {
  export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MENTOR' | 'STUDENT';

  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    [model: string]: any;
  }
}
