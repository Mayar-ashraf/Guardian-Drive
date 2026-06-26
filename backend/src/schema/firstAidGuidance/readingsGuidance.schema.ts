import { z } from "zod";

export const GetReadingsGuidanceSchema = z.object({
    query: z.object({
        heartRate: z.coerce.number().max(300),
        temp: z.coerce.number().min(30).max(45),
        spo2: z.coerce.number().min(50).max(100),
    }).strict()
});
