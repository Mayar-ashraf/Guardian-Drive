import { z } from "zod"
const getGuidanceByIdSchema = z.object({
    body: z.undefined(),
    query: z.object({}).strict(),
    params: z.object({
        guidanceId: z.coerce.number().positive().int()
    }).strict()
})
export { getGuidanceByIdSchema }