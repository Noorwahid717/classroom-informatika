import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpsertRubricSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  criteria: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        weight: z.number().min(0).max(1)
      })
    )
    .nonempty()
});

export class UpsertRubricDto extends createZodDto(UpsertRubricSchema) {}
