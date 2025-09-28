import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpsertContentSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  body: z.string(),
  published: z.boolean().optional(),
  authorId: z.string().uuid().optional()
});

export class UpsertContentDto extends createZodDto(UpsertContentSchema) {}
