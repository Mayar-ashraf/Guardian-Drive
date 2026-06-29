import { z } from "zod";

export const getAvgReadingsPerTripSchema = z.object({
    params: z.object({
        tripId: z.coerce.number().int().positive()
    }),
    body: z.undefined(),
})