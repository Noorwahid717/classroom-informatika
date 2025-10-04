import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { JwtService } from "@api/security/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtAuthGuard],
  exports: [JwtService, JwtAuthGuard]
})
export class AuthModule {}
