import { z } from "zod"
const tripStatusValues = ["PLANNED", "ONGOING", "CANCELLED", "COMPLETED"] as const;
const readTripsSchema = z.object({
    body: z.object({}).strict(),
    query: z.object({
        engineId: z.string().optional(),
        driverId: z.coerce.number().int().optional(),
        status: z.string().trim().transform(val => val.toUpperCase()).pipe(z.enum(tripStatusValues)).optional(),
        fromStartDate: z.iso.datetime().optional(),
        toStartDate: z.iso.datetime().optional(),
        fleetManagerId: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().default(10),
        page: z.coerce.number().int().positive().default(1),
        orderBy: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["asc", "desc"])).default('asc')

    }).strict(),
    params: z.object({}).strict()
})
export { readTripsSchema }