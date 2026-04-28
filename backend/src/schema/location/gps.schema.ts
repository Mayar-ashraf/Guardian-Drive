import z from "zod";

export const gpsSchema = z.object({
  latitude: z.coerce.number("Latitude must be a valid number"),
  longitude: z.coerce.number("Longitude must be a valid number"),
}).strict();
