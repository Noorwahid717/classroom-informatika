import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto, GoogleAuthDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import type { FastifyRequest } from "fastify";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  async login(@Body() dto: AuthCredentialsDto) {
    return this.auth.validateCredentials(dto);
  }

  @Post("google")
  async google(@Body() dto: GoogleAuthDto) {
    return this.auth.upsertGoogleUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("session")
  async session(@Req() req: FastifyRequest) {
    const requestUser = req.user as { sub?: string } | undefined;
    const userId = requestUser?.sub as string;
    const session = await this.auth.getSession(userId);
    return { user: session };
  }
}
