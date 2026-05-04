// src/validators/avgHealthReadings.validator.ts
import { z } from "zod";

export const createAvgReadingsSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    }),
    body: z.object({
        tripId: z.number().int().positive(),
        avgHeartRate: z.coerce.number().positive("avgHeartRate must be positive")
            .max(300, "avgHeartRate out of realistic range"),

        avgSpo2: z
            .number().min(50, "avgSpo2 out of realistic range")
            .max(100, "avgSpo2 cannot exceed 100%"),

        avgTemp: z
            .number().min(30, "avgTemp out of realistic range")
            .max(45, "avgTemp out of realistic range"),

    })
});


export const getDriverAvgReadingsSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    }),
})