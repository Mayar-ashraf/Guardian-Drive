import { z } from "zod";

export const DeleteGuidanceSchema = z.object({
    params: z.object({
        guidanceId: z.coerce.number().int().positive()
    })
});
