import { z } from 'zod'

export const deviceIdSchema = z.object({
    deviceId: z.coerce.number("Device Id must be a valid number")
        .int("Device Id must be an integer")
        .positive("Device Id must be positive")
}).strict();

export const getAllWearableBandsSchema = z.object({
    params: z.object({}).strict(),
    query: z.object({
        deviceId: z.coerce.number("Device Id must be a valid number").int("Device Id must be an integer").positive("Device Id must be positive").optional(),
        driverId: z.coerce.number("Driver Id must be a valid number").int("Driver Id must be an integer").positive("Driver Id must be positive").optional(),
        isConnected: z.coerce.boolean().optional(),
        sensor: z.string().optional(),
        limit: z.coerce.number().int().positive().default(10),
        page: z.coerce.number().int().positive().default(1),
        orderBy: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["asc", "desc"])).default("asc"),
    }).strict(),
    body: z.object({}).strict()
})

export const getWearablebandSchema = z.object({
    params: deviceIdSchema,
    query: z.object({}).strict(),
});