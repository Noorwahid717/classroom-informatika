import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertContentDto } from "./dto/upsert-content.dto";

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  list(includeDraft: boolean) {
    return this.prisma.announcement.findMany({
      where: includeDraft ? {} : { published: true },
      orderBy: { createdAt: "desc" }
    });
  }

  upsert(dto: UpsertContentDto) {
    if (!dto.authorId) {
      throw new BadRequestException("authorId is required");
    }
    const where = dto.id ? { id: dto.id } : { slug: dto.slug };
    return this.prisma.announcement.upsert({
      where,
      update: { title: dto.title, slug: dto.slug, body: dto.body, published: dto.published ?? false },
      create: {
        title: dto.title,
        slug: dto.slug,
        body: dto.body,
        published: dto.published ?? false,
        authorId: dto.authorId
      }
    });
  }
}
