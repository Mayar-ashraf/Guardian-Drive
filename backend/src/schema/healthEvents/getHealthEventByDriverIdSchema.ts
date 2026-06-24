import { z } from "zod";

export const getHealthEventByDriverIdSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    })
})
