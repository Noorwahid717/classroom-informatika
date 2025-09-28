import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpsertClassSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  capacity: z.number().int().positive()
});

export class UpsertClassDto extends createZodDto(UpsertClassSchema) {}
