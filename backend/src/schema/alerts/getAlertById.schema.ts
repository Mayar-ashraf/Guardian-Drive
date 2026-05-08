import { z } from "zod"

export const getAlertByIdSchema = z.object({
    params: z.object({
        alertId: z.coerce.number().int().positive(),
    })
});