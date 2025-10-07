import { Body, Controller, Get, Headers, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ContentService } from "./content.service";
import { UpsertContentDto } from "./dto/upsert-content.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { env } from "@api/config/env";
import type { FastifyRequest } from "fastify";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Role } from "@api/constants/prisma";

@Controller("content")
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  list(@Headers("x-api-key") apiKey: string | undefined) {
    const includeDraft = apiKey === env.INTERNAL_API_KEY;
    return this.content.list(includeDraft);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  @Get("manage")
  manage() {
    return this.content.list(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  @Post()
  create(@Body() dto: UpsertContentDto, @Req() req: FastifyRequest) {
    const user = req.user as { sub?: string } | undefined;
    const authorId = (user?.sub as string) ?? dto.authorId;
    return this.content.upsert({ ...dto, authorId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpsertContentDto, @Req() req: FastifyRequest) {
    const user = req.user as { sub?: string } | undefined;
    const authorId = (user?.sub as string) ?? dto.authorId;
    return this.content.upsert({ ...dto, id, authorId });
  }
}
