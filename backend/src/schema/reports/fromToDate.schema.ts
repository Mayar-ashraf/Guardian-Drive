import { z } from 'zod'

export const fromToDateSchema = z.object({
    query: z.object({
        from: z.coerce.date("A valid 'from' date is required"),
        to: z.coerce.date("A valid 'to' date is required")
    }).refine(
        (data) => data.from <= data.to,
        {
            message: "'from' date must be before 'to' date",
            path: ["to"]
        }
    ).strict()
});