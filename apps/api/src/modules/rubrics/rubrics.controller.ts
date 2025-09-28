import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { RubricsService } from "./rubrics.service";
import { UpsertRubricDto } from "./dto/upsert-rubric.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";

@Controller("rubrics")
export class RubricsController {
  constructor(private readonly rubrics: RubricsService) {}

  @Get()
  list() {
    return this.rubrics.list();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Body() dto: UpsertRubricDto) {
    return this.rubrics.upsert(dto);
  }
}
