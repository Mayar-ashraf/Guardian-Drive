import { z } from "zod";

export const deleteUserbyIDschema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "User ID must be a number"),
    }).strict(),

  /*  body: z.object({
        newFleetManagerId: z.number().optional(),
        newDriverId: z.number().optional()
    })
    .strict()
    .refine(
        (data) => !(data.newFleetManagerId && data.newDriverId),
        {
            message: "Provide only one reassignment ID, not both"
        }
    )*/
});