import { SubmissionStatus } from "@api/constants/prisma";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const submissionStatusValues = Object.values(SubmissionStatus) as [SubmissionStatus, ...SubmissionStatus[]];

export const UpdateSubmissionSchema = z
  .object({
    repositoryUrl: z.string().url().optional(),
    previewUrl: z.string().url().nullable().optional(),
    status: z.enum(submissionStatusValues).optional()
  })
  .refine((value) => Object.keys(value).length > 0, "Minimal satu field untuk pembaruan");

export class UpdateSubmissionDto extends createZodDto(UpdateSubmissionSchema) {}
