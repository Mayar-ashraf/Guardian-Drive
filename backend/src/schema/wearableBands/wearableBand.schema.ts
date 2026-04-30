import { z } from 'zod'

export const deviceIdSchema = z.object({
    deviceId: z.coerce.number("Device Id must be a valid number")
        .int("Device Id must be an integer")
        .positive("Device Id must be positive")
}).strict();

export const getWearablebandSchema = z.object({
    params: deviceIdSchema,
    query: z.object({}).strict(),
});