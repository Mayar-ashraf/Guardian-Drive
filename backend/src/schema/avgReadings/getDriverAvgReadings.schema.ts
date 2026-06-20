import { z } from "zod";

export const getDriverAvgReadingsSchema = z.object({
    params: z.object({
        userId: z.coerce.number().int().positive()
    }),
})