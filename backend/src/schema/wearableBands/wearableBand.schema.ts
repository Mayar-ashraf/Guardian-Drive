import { brotliDecompress } from 'node:zlib';
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
        isConnected: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["true", "false"])).transform(val => val === "true").optional(),
        sensor: z.string().optional(),
        limit: z.coerce.number().int().positive().default(10),
        page: z.coerce.number().int().positive().default(1),
        orderBy: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["asc", "desc"])).default("asc"),
    }).strict(),
    body: z.object({}).strict()
})

export const getWearableBandSchema = z.object({
    params: deviceIdSchema,
    query: z.object({}).strict(),
});

export const wearableBandSchema = z.object({
    deviceId: z.coerce.number("Device Id must be a valid number").int("Device Id must be an integer").positive("Device Id must be positive"),
    sensorList: z.array(z.string("Sensors should be string").trim().min(1, "Sensor List should not be empty").toLowerCase()),
    batteryLevel: z.number("Battery level must be a valid number").int("Battery level must be an integer").min(0, "Battery level cannot be below 0").max(100, "Battery level cannot exceed 100").optional().default(100),
    isConnected: z.coerce.boolean({ error: "isConnected must be a valid boolean value" }).optional().default(false),
    driverId: z.coerce.number("Driver Id must be a valid number").int("Driver Id must be an integer").positive("Driver Id must be positive").optional()
}).strict();

export const addWearableBandSchema = z.object({
    body: wearableBandSchema,
    params: z.object({}).strict(),
    query: z.object({}).strict()
});

export const deleteBandSchema = z.object({
    params: deviceIdSchema,
    query: z.object({}).strict(),
    body: z.object({}).strict()
}).strict();

export const updateBandSchema = z.object({
    params: deviceIdSchema,
    query: z.object({}).strict(),
    body: z.object({
        sensorList: z.array(z.string().trim().min(1, "Sensor List should not be empty").toLowerCase()).optional(),
        batteryLevel: z.number("Battery level must be a valid number").int("Battery level must be an integer").min(0, "Battery level cannot be below 0").max(100, "Battery level cannot exceed 100").optional(),
        isConnected: z.coerce.boolean({ error: "isConnected must be a valid boolean value" }).optional(),
        driverId: z.coerce.number("Driver Id must be a valid number").int("Driver Id must be an integer").positive("Driver Id must be positive").optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update"
    }).strict()
});