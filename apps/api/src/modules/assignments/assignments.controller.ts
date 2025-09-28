import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AssignmentsService } from "./assignments.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./dto/assignment.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Role } from "@prisma/client";

@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get("class/:classId")
  list(@Param("classId") classId: string) {
    return this.assignments.listByClass(classId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get(":id")
  get(@Param("id") id: string) {
    return this.assignments.getById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  @Post()
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignments.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignments.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MENTOR)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.assignments.remove(id);
  }
}
