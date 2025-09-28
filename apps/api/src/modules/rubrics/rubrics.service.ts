import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertRubricDto } from "./dto/upsert-rubric.dto";

@Injectable()
export class RubricsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.rubric.findMany({ include: { criteria: true } });
  }

  upsert(dto: UpsertRubricDto) {
    return this.prisma.$transaction(async (tx) => {
      const rubric = await tx.rubric.upsert({
        where: { id: dto.id ?? "" },
        update: { title: dto.title, description: dto.description },
        create: { title: dto.title, description: dto.description }
      });

      await tx.rubricCriteria.deleteMany({ where: { rubricId: rubric.id } });
      await tx.rubricCriteria.createMany({
        data: dto.criteria.map((criterion) => ({
          rubricId: rubric.id,
          title: criterion.title,
          description: criterion.description,
          weight: criterion.weight
        }))
      });

      return tx.rubric.findUnique({ where: { id: rubric.id }, include: { criteria: true } });
    });
  }
}
