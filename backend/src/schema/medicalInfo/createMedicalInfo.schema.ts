import { z } from "zod";

export const createMedicalInfoSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    }),
    body: z.object({
        conditions: z.array(z.string()).default([]), // default for empty assignment - no value set
        medications: z.array(z.string()).default([]),

        avgTemp: z.number().min(30).max(45),
        avgHeartRate: z.number().positive().max(300),
        avgSpo2: z.number().min(50).max(100),

        minTemp: z.number().min(30).max(45).optional(),
        minHeartRate: z.number().positive().max(300).optional(),
        minSpo2: z.number().min(50).max(100).optional(),

        maxTemp: z.number().min(30).max(45).optional(),
        maxHeartRate: z.number().positive().max(300).optional(),
        maxSpo2: z.number().min(50).max(100).optional(),

    })
});
