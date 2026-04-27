import z from "zod";

export const gpsSchema = z.object({
  latitude: z.coerce.number().refine((val) => !isNaN(val), {
    message: "Latitude must be a valid number",
  }),
  longitude: z.coerce.number().refine((val) => !isNaN(val), {
    message: "Longitude must be a valid number",
  }),
}).strict();

export type gpsBody = z.infer<typeof gpsSchema>;
