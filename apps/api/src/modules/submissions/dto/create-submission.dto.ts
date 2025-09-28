import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateSubmissionSchema = z.object({
  assignmentId: z.string().uuid(),
  repositoryUrl: z.string().url(),
  previewUrl: z.string().url().optional()
});

export class CreateSubmissionDto extends createZodDto(CreateSubmissionSchema) {}
