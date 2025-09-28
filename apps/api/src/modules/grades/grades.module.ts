import { Module } from "@nestjs/common";
import { GradesController } from "./grades.controller";
import { GradesService } from "./grades.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [GradesController],
  providers: [GradesService]
})
export class GradesModule {}
