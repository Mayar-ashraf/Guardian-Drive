import { brotliDecompressSync } from 'node:zlib';
import { z } from 'zod'

export const emergencyPerformanceSchema = z.object({
    params: z.object({}).strict(),
    body: z.object({}).strict(),
    query: z.object({
        from: z.coerce.date(),
        to: z.coerce.date()
    }).refine(
        (data) => data.from <= data.to,
        {
            message: "'from' date must be before 'to' date",
            path: ["to"]
        }
    ).strict()
});