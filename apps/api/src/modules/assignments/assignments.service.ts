import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./dto/assignment.dto";

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  listByClass(classId: string) {
    return this.prisma.assignment.findMany({ where: { classId }, include: { rubric: true } });
  }

  async getById(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { rubric: { include: { criteria: true } }, classroom: true }
    });
    if (!assignment) {
      throw new NotFoundException("Assignment tidak ditemukan");
    }
    return assignment;
  }

  async create(dto: CreateAssignmentDto) {
    await this.ensureClassExists(dto.classId);
    await this.ensureRubric(dto.rubricId ?? undefined);
    const rubricId = dto.rubricId === null ? null : dto.rubricId ?? undefined;
    return this.prisma.assignment.create({
      data: {
        classId: dto.classId,
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt,
        rubricId,
        maxScore: dto.maxScore ?? 100,
        instructions: dto.instructions ?? null
      }
    });
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const existing = await this.prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Assignment tidak ditemukan");
    }
    if (dto.classId && dto.classId !== existing.classId) {
      await this.ensureClassExists(dto.classId);
    }
    if (dto.rubricId !== undefined) {
      await this.ensureRubric(dto.rubricId ?? undefined);
    }
    const rubricId = dto.rubricId === undefined ? existing.rubricId : dto.rubricId === null ? null : dto.rubricId;
    return this.prisma.assignment.update({
      where: { id },
      data: {
        classId: dto.classId ?? existing.classId,
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        dueAt: dto.dueAt ?? existing.dueAt,
        rubricId,
        maxScore: dto.maxScore ?? existing.maxScore,
        instructions: dto.instructions ?? existing.instructions
      }
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Assignment tidak ditemukan");
    }
    await this.prisma.assignment.delete({ where: { id } });
    return { id };
  }

  private async ensureClassExists(classId: string) {
    const exists = await this.prisma.classroom.count({ where: { id: classId } });
    if (!exists) {
      throw new BadRequestException("Classroom tidak valid");
    }
  }

  private async ensureRubric(rubricId?: string | null) {
    if (!rubricId) {
      return;
    }
    const exists = await this.prisma.rubric.count({ where: { id: rubricId } });
    if (!exists) {
      throw new BadRequestException("Rubrik tidak ditemukan");
    }
  }
}
