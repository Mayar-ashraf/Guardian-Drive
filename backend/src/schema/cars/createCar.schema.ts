import { z } from "zod";

export const carStatusValues = ["ACTIVE", "IN_TRIP", "DISABLED"] as const;
export const createCarSchema = z.object({
  body: z.object({
    engineId: z.string().min(1),
    plateNo: z.string().min(3),
    color: z.string().min(1),
    status: z
      .string()
      .trim()
      .transform(val => val.toUpperCase())
      .pipe(z.enum(carStatusValues)),
  }).strict(),

query: z.object({}).optional(),
params: z.object({}).optional(),
});
