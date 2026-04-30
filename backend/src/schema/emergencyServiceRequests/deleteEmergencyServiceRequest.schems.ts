import { z } from "zod"
const deleteEmergencyServiceRequestSchema = z.object({
    body: z.object({}).strict(),
    query: z.object({}).strict(),
    params: z.object({
        requestId: z.coerce.number().positive().int()
    }).strict()
})
export { deleteEmergencyServiceRequestSchema }