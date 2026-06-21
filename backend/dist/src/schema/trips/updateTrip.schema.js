"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fleetManagerUpdateTripSchema = exports.driverUpdateTripSchema = void 0;
const zod_1 = require("zod");
const tripStatusValues = ["PLANNED", "ONGOING", "CANCELLED", "COMPLETED"];
const driverUpdateTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.string().trim().transform(val => val.toUpperCase()).pipe(zod_1.z.enum(["ONGOING", "COMPLETED"])),
    }).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        tripId: zod_1.z.coerce.number().int().positive()
    }).strict()
});
exports.driverUpdateTripSchema = driverUpdateTripSchema;
const fleetManagerUpdateTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        startPoint: zod_1.z.string().min(1).optional(),
        destPoint: zod_1.z.string().min(1).optional(),
        plannedStartTime: zod_1.z.iso.datetime().optional(),
        fleetManagerId: zod_1.z.coerce.number().int().positive().optional(),
        engineId: zod_1.z.string().optional(),
        driverId: zod_1.z.coerce.number().positive().int().optional(),
        status: zod_1.z.string().trim().transform(val => val.toUpperCase()).pipe(zod_1.z.enum(tripStatusValues)).optional(),
        //if driver forgot to start or end trip
        endTime: zod_1.z.iso.datetime().optional(),
        startTime: zod_1.z.iso.datetime().optional()
    }).strict().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    }),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        tripId: zod_1.z.coerce.number().int().positive()
    }).strict()
});
exports.fleetManagerUpdateTripSchema = fleetManagerUpdateTripSchema;
