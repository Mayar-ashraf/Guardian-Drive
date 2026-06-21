"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTripSchema = void 0;
const zod_1 = require("zod");
const createTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        startLatitude: zod_1.z.coerce.number().min(-90).max(90),
        startLongitude: zod_1.z.coerce.number().min(-180).max(180),
        destLatitude: zod_1.z.coerce.number().min(-90).max(90),
        destLongitude: zod_1.z.coerce.number().min(-180).max(180),
        plannedStartTime: zod_1.z.iso.datetime(),
        fleetManagerId: zod_1.z.coerce.number().int().positive(),
        engineId: zod_1.z.string().optional(),
        driverId: zod_1.z.coerce.number().positive().int().optional()
    }).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({}).strict(),
});
exports.createTripSchema = createTripSchema;
