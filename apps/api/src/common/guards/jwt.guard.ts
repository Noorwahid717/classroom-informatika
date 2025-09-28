import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { env } from "@classroom/config/env";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers["authorization"] as string | undefined;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException();
    }
    const token = authorization.slice(7);
    if (token === env.INTERNAL_API_KEY) {
      request.user = { sub: "service-account", role: "ADMIN" };
      return true;
    }
    try {
      const payload = this.jwt.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
