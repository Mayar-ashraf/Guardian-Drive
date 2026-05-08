import { z } from "zod";

export const UpdateGuidanceSchema = z.object({
    params: z.object({
        guidanceId: z.coerce.number().int().positive()
    }),
    body: z.object({
        description: z.string().optional(),
        specificAction: z.string().optional()
    })
});
