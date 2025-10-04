import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

export function FastifyFileInterceptor(): NestInterceptor {
  return {
    intercept(_: ExecutionContext, next: CallHandler) {
      return next.handle();
    }
  };
}
