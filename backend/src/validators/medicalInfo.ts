import { z } from "zod";

export const createMedicalInfoSchema = z.object({
    conditions: z.array(z.string()).default([]), // default for empty assignment - no value set
    medications: z.array(z.string()).default([]),
});

export const UpdateMedicalRecordSchema = z.object({
    conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
});

/*
// this may be used for both uodate and create schemas for both not to interfere with each other
// if update has empty field , create would fill it with [] and lose the saved data 
*/