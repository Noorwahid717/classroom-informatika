import { SubmissionStatus } from "@prisma/client";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateSubmissionSchema = z
  .object({
    repositoryUrl: z.string().url().optional(),
    previewUrl: z.string().url().nullable().optional(),
    status: z.nativeEnum(SubmissionStatus).optional()
  })
  .refine((value) => Object.keys(value).length > 0, "Minimal satu field untuk pembaruan");

export class UpdateSubmissionDto extends createZodDto(UpdateSubmissionSchema) {}
