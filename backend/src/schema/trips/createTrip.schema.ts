import { z } from "zod"
const createTripSchema = z.object({
    body: z.object({
        startPoint: z.string().min(1),
        destPoint: z.string().min(1),
        plannedStartTime: z.iso.datetime(),
        fleetManagerId: z.coerce.number().int().positive(),
        engineId: z.string().optional(),
        driverId: z.coerce.number().positive().int().optional()
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({}).strict(),
})
export { createTripSchema }