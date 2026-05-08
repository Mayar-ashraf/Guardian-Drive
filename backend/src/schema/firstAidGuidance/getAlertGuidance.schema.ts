import { z } from "zod";

export const GetAlertGuidanceSchema = z.object({
    params: z.object({
        alertId: z.coerce.number().int().positive()
    })
});
