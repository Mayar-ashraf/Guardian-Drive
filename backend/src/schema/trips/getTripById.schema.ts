import { z } from "zod"

const getTripByIdSchema = z.object({
    body: z.undefined(),
    query: z.object({}).strict(),
    params: z.object({
        tripId: z.coerce.number().int().positive()
    }).strict()
})
export { getTripByIdSchema }