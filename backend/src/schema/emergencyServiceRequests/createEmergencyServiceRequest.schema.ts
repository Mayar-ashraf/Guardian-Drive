import { z } from "zod"
const createEmergencyServiceRequestSchema = z.object({
    body: z.object({
        requestTime: z.iso.datetime().optional(),
        phone: z.string().min(1),
        hospitalAssigned: z.string().min(1),
        alertId: z.coerce.number().positive().int(),
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({}).strict()
})
export { createEmergencyServiceRequestSchema }