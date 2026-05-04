import { z } from "zod";

export const createMedicalInfoSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    }),
    body: z.object({
        conditions: z.array(z.string()).default([]), // default for empty assignment - no value set
        medications: z.array(z.string()).default([]),

        // these are ones that are set for all min,max,avg , can also create MIN , MAX , AVG per each
        temp: z.coerce.number().min(30).max(45),
        heartRate: z.coerce.number().positive().max(300),
        spo2: z.coerce.number().min(50).max(100),

    })
});

export const UpdateMedicalRecordSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    }),
    body: z.object({
        conditions: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
    })
});

export const getMedicalRecordByIdSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    })
})

/*
// this may be used for both uodate and create schemas for both not to interfere with each other
// if update has empty field , create would fill it with [] and lose the saved data 
*/