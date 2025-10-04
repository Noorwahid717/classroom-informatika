import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@api/security/jwt";
import { compare, hash } from "bcryptjs";
import { AuthCredentialsDto, GoogleAuthDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async validateCredentials({ email, password }: AuthCredentialsDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.needsPasswordRehash) {
      const newHash = await hash(password, 12);
      await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash, needsPasswordRehash: false } });
    }

    return this.generateTokens(user.id, user.role);
  }

  async upsertGoogleUser(dto: GoogleAuthDto) {
    const user = await this.prisma.user.upsert({
      where: { email: dto.email },
      update: {
        name: dto.name,
        googleId: dto.googleId,
        avatarUrl: dto.avatarUrl,
        emailVerifiedAt: new Date()
      },
      create: {
        email: dto.email,
        name: dto.name,
        googleId: dto.googleId,
        avatarUrl: dto.avatarUrl,
        role: "STUDENT",
        emailVerifiedAt: new Date()
      }
    });

    return this.generateTokens(user.id, user.role);
  }

  async getSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true }
    });
    return user;
  }

  private async generateTokens(userId: string, role: string) {
    const accessToken = this.jwt.sign({ sub: userId, role }, { expiresIn: "15m" });
    const refreshToken = this.jwt.sign({ sub: userId, role }, { expiresIn: "7d" });
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    return { accessToken, refreshToken };
  }
}
