import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const AssignmentBaseSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  dueAt: z.coerce.date().optional(),
  rubricId: z.union([z.string().uuid(), z.null()]).optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
  instructions: z.string().min(10).optional()
});

export const CreateAssignmentSchema = AssignmentBaseSchema;
export class CreateAssignmentDto extends createZodDto(CreateAssignmentSchema) {}

export const UpdateAssignmentSchema = AssignmentBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Minimal satu field diperlukan untuk pembaruan"
);
export class UpdateAssignmentDto extends createZodDto(UpdateAssignmentSchema) {}
