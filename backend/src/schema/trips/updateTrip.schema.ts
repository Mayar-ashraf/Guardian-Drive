import { z } from "zod"

const tripStatusValues = ["PLANNED", "ONGOING", "CANCELLED", "COMPLETED"] as const;
const driverUpdateTripSchema = z.object({
    body: z.object({
        status: z.string().trim().transform(val => val.toUpperCase()).pipe(z.enum(["ONGOING", "COMPLETED"])),
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({
        tripId: z.coerce.number().int().positive()
    }).strict()
})
const fleetManagerUpdateTripSchema = z.object({
    body: z.object({
        startPoint: z.string().min(1).optional(),
        destPoint: z.string().min(1).optional(),
        startLatitude: z.coerce.number().min(-90).max(90).optional(),
        startLongitude: z.coerce.number().min(-180).max(180).optional(),
        destLatitude: z.coerce.number().min(-90).max(90).optional(),
        destLongitude: z.coerce.number().min(-180).max(180).optional(),
        plannedStartTime: z.iso.datetime().optional(),
        fleetManagerId: z.coerce.number().int().positive().optional(),
        engineId: z.string().optional(),
        driverId: z.coerce.number().positive().int().optional(),
        status: z.string().trim().transform(val => val.toUpperCase()).pipe(z.enum(tripStatusValues)).optional(),
        //if driver forgot to start or end trip
        endTime: z.iso.datetime().optional(),
        startTime: z.iso.datetime().optional()
    }).strict().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    }),
    query: z.object({
    }).strict(),
    params: z.object({
        tripId: z.coerce.number().int().positive()
    }).strict()
})
export { driverUpdateTripSchema, fleetManagerUpdateTripSchema }