import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpsertGradeSchema = z.object({
  submissionId: z.string().uuid(),
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
  rubricSnapshot: z.record(z.any())
});

export class UpsertGradeDto extends createZodDto(UpsertGradeSchema) {}
