import { Controller, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesService } from "./files.service";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@api/constants/prisma";
import { FastifyFileInterceptor } from "../../common/interceptors/file.interceptor";
import type { FastifyRequest } from "fastify";
import type { FastifyFile } from "@fastify/multipart";

@Controller("files")
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @Post("submissions/:id/archive")
  @UseInterceptors(FastifyFileInterceptor())
  uploadSubmissionArchive(
    @Param("id") submissionId: string,
    @UploadedFile() file: FastifyFile,
    @Req() req: FastifyRequest
  ) {
    const user = req.user as { sub: string; role: Role };
    return this.files.uploadSubmissionArchive({ submissionId, user, file });
  }
}
