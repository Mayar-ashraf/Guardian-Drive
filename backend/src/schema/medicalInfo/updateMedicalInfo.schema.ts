
import { z } from "zod";

export const UpdateMedicalRecordSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    }),
    body: z.object({
        conditions: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),

        avgTemp: z.number().min(30).max(45).optional(),
        avgHeartRate: z.number().positive().max(300).optional(),
        avgSpo2: z.number().min(50).max(100).optional(),

        minTemp: z.number().min(30).max(45).optional(),
        minHeartRate: z.number().positive().max(300).optional(),
        minSpo2: z.number().min(50).max(100).optional(),

        maxTemp: z.number().min(30).max(45).optional(),
        maxHeartRate: z.number().positive().max(300).optional(),
        maxSpo2: z.number().min(50).max(100).optional(),
    })
});


/*
// this may be used for both uodate and create schemas for both not to interfere with each other
// if update has empty field , create would fill it with [] and lose the saved data 
*/