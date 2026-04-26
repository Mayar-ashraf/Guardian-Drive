import { z } from "zod"

const deleteTripSchema = z.object({
    body: z.object({}).strict(),
    query: z.object({}).strict(),
    params: z.object({
        tripId: z.coerce.number().int().positive()
    }).strict()
})
export { deleteTripSchema }