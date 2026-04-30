import { z } from "zod";

export const getCarByIdSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: z.object({
    engineId: z.string().min(1),
  }).strict(),
});