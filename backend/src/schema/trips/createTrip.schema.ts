import { z } from "zod"
const createTripSchema = z.object({
    body: z.object({
        startLatitude: z.coerce.number().min(-90).max(90),
        startLongitude: z.coerce.number().min(-180).max(180),
        destLatitude: z.coerce.number().min(-90).max(90),
        destLongitude: z.coerce.number().min(-180).max(180),
        plannedStartTime: z.iso.datetime(),
        fleetManagerId: z.coerce.number().int().positive(),
        engineId: z.string().optional(),
        driverId: z.coerce.number().positive().int().optional()
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({}).strict(),
})
export { createTripSchema }