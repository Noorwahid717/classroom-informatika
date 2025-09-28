import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { GradesService } from "./grades.service";
import { UpsertGradeDto } from "./dto/upsert-grade.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";

@Controller("grades")
export class GradesController {
  constructor(private readonly grades: GradesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(":submissionId")
  find(@Param("submissionId") submissionId: string) {
    return this.grades.findBySubmission(submissionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Body() dto: UpsertGradeDto) {
    return this.grades.upsert(dto);
  }
}
