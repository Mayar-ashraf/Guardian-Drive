import { z } from "zod";

export const getAllCarsSchema = z.object({
  body: z.undefined(),

  query: z.object({
    status: z.string().optional(),
    color: z.string().optional(),
    plateNo: z.string().optional(),
  }).strict(),

  params: z.object({}).strict(),
});