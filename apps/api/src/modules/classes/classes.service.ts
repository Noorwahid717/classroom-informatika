import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertClassDto } from "./dto/upsert-class.dto";

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.classroom.findMany({ include: { mentors: true, assignments: true } });
  }

  findOne(id: string) {
    return this.prisma.classroom.findUnique({ where: { id }, include: { mentors: true, assignments: true } });
  }

  async upsert(dto: UpsertClassDto) {
    return this.prisma.classroom.upsert({
      where: { id: dto.id ?? "" },
      update: {
        title: dto.title,
        description: dto.description,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        capacity: dto.capacity
      },
      create: {
        title: dto.title,
        description: dto.description,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        capacity: dto.capacity
      }
    });
  }
}
