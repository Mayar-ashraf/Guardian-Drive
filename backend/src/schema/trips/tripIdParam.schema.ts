import { z } from "zod";

export const tripIdParamSchema = z.object({
    tripId: z.coerce.number().int().positive(),
});

export type tripIdParams = z.infer<typeof tripIdParamSchema>;
