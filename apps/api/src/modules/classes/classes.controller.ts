import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ClassesService } from "./classes.service";
import { UpsertClassDto } from "./dto/upsert-class.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";

@Controller("classes")
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get()
  findAll() {
    return this.classes.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.classes.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Body() dto: UpsertClassDto) {
    return this.classes.upsert(dto);
  }
}
