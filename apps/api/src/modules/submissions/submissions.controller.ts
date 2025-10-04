import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { SubmissionsService } from "./submissions.service";
import { CreateSubmissionDto } from "./dto/create-submission.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Role } from "@api/constants/prisma";
import { UpdateSubmissionDto } from "./dto/update-submission.dto";
import type { FastifyRequest } from "fastify";

@Controller("submissions")
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get("assignment/:assignmentId")
  list(@Param("assignmentId") assignmentId: string, @Req() req: FastifyRequest) {
    const user = req.user as { sub: string; role: Role };
    return this.submissions.listByAssignment(assignmentId, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get(":id")
  get(@Param("id") id: string, @Req() req: FastifyRequest) {
    const user = req.user as { sub: string; role: Role };
    return this.submissions.getById(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.ADMIN, Role.MENTOR)
  @Post()
  create(@Body() dto: CreateSubmissionDto, @Req() req: FastifyRequest) {
    const user = req.user as { sub: string; role: Role };
    return this.submissions.create(user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSubmissionDto, @Req() req: FastifyRequest) {
    const user = req.user as { sub: string; role: Role };
    return this.submissions.update(id, user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: FastifyRequest) {
    const user = req.user as { sub: string; role: Role };
    return this.submissions.remove(id, user);
  }
}
