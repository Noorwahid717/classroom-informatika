declare module "fastify" {
  export interface FastifyRequest {
    headers: Record<string, string | undefined>;
    user?: unknown;
  }
}

declare module "fastify-helmet" {
  const plugin: (...args: unknown[]) => void;
  export default plugin;
}

declare module "fastify-rate-limit" {
  const plugin: (...args: unknown[]) => void;
  export default plugin;
}

declare module "@fastify/multipart" {
  export interface FastifyFile {
    filename: string;
    mimetype: string;
    encoding: string;
    file: NodeJS.ReadableStream;
    fields: Record<string, unknown>;
    toBuffer(): Promise<Buffer>;
  }
  const plugin: (...args: unknown[]) => void;
  export default plugin;
}

declare module "bcryptjs" {
  export function hash(data: string, rounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}
