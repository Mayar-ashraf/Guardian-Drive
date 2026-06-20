import { z } from "zod";

export const createAvgReadingsSchema = z.object({
    params: z.object({
        userId: z.coerce.number().int().positive()
    }),
    body: z.object({
        tripId: z.number().int().positive(),
        avgHeartRate: z.number().positive("avgHeartRate must be positive")
            .max(300, "avgHeartRate out of realistic range"),

        avgSpo2: z
            .number().min(50, "avgSpo2 out of realistic range")
            .max(100, "avgSpo2 cannot exceed 100%"),

        avgTemp: z
            .number().min(30, "avgTemp out of realistic range")
            .max(45, "avgTemp out of realistic range"),

    })
});