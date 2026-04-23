import { z } from "zod"
import { Role, tripStatus } from "../../../generated/prisma/enums";

const createTripSchema = z.object({
    body: z.object({
        startPoint: z.string().min(1),
        destPoint: z.string().min(1),
        plannedStartTime: z.iso.datetime(),
        fleetManagerId: z.coerce.number().int(),
        engineId: z.string().optional(),
        driverId: z.coerce.number().int().optional()
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({}).strict(),
})
export { createTripSchema }