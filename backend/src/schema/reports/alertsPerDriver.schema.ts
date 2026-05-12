import { z } from "zod";

export const alertsPerDriverSchema = z.object({
  params: z.object({
    driverId: z.coerce.number().int().positive()
  }),

  query: z.object({
    from: z.coerce.date(),
    to: z.coerce.date()
  }).refine(
    (data) => data.from <= data.to,
    {
      message: "'from' date must be before 'to' date",
      path: ["to"]
    }
  )
});