"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBandSchema = exports.deleteBandSchema = exports.addWearableBandSchema = exports.wearableBandSchema = exports.getWearableBandSchema = exports.getAllWearableBandsSchema = exports.deviceIdSchema = void 0;
const zod_1 = require("zod");
exports.deviceIdSchema = zod_1.z.object({
    deviceId: zod_1.z.coerce.number("Device Id must be a valid number")
        .int("Device Id must be an integer")
        .positive("Device Id must be positive")
}).strict();
exports.getAllWearableBandsSchema = zod_1.z.object({
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({
        deviceId: zod_1.z.coerce.number("Device Id must be a valid number").int("Device Id must be an integer").positive("Device Id must be positive").optional(),
        driverId: zod_1.z.coerce.number("Driver Id must be a valid number").int("Driver Id must be an integer").positive("Driver Id must be positive").optional(),
        isConnected: zod_1.z.string().transform(val => val.toLowerCase()).pipe(zod_1.z.enum(["true", "false"])).transform(val => val === "true").optional(),
        sensor: zod_1.z.string().optional(),
        limit: zod_1.z.coerce.number().int().positive().default(10),
        page: zod_1.z.coerce.number().int().positive().default(1),
        orderBy: zod_1.z.string().transform(val => val.toLowerCase()).pipe(zod_1.z.enum(["asc", "desc"])).default("asc"),
    }).strict(),
    body: zod_1.z.object({}).strict()
});
exports.getWearableBandSchema = zod_1.z.object({
    params: exports.deviceIdSchema,
    query: zod_1.z.object({}).strict(),
});
exports.wearableBandSchema = zod_1.z.object({
    deviceId: zod_1.z.coerce.number("Device Id must be a valid number").int("Device Id must be an integer").positive("Device Id must be positive"),
    sensorList: zod_1.z.array(zod_1.z.string("Sensors should be string").trim().min(1, "Sensor List should not be empty").toLowerCase()),
    batteryLevel: zod_1.z.number("Battery level must be a valid number").int("Battery level must be an integer").min(0, "Battery level cannot be below 0").max(100, "Battery level cannot exceed 100").optional().default(100),
    isConnected: zod_1.z.coerce.boolean({ error: "isConnected must be a valid boolean value" }).optional().default(false),
    driverId: zod_1.z.coerce.number("Driver Id must be a valid number").int("Driver Id must be an integer").positive("Driver Id must be positive").optional()
}).strict();
exports.addWearableBandSchema = zod_1.z.object({
    body: exports.wearableBandSchema,
    params: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict()
});
exports.deleteBandSchema = zod_1.z.object({
    params: exports.deviceIdSchema,
    query: zod_1.z.object({}).strict(),
    body: zod_1.z.object({}).strict()
}).strict();
exports.updateBandSchema = zod_1.z.object({
    params: exports.deviceIdSchema,
    query: zod_1.z.object({}).strict(),
    body: zod_1.z.object({
        sensorList: zod_1.z.array(zod_1.z.string().trim().min(1, "Sensor List should not be empty").toLowerCase()).optional(),
        batteryLevel: zod_1.z.number("Battery level must be a valid number").int("Battery level must be an integer").min(0, "Battery level cannot be below 0").max(100, "Battery level cannot exceed 100").optional(),
        isConnected: zod_1.z.coerce.boolean({ error: "isConnected must be a valid boolean value" }).optional(),
        driverId: zod_1.z.coerce.number("Driver Id must be a valid number").int("Driver Id must be an integer").positive("Driver Id must be positive").optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update"
    }).strict()
});
