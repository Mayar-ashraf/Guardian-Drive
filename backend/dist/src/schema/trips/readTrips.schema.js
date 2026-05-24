"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTripsSchema = void 0;
const zod_1 = require("zod");
const tripStatusValues = ["PLANNED", "ONGOING", "CANCELLED", "COMPLETED"];
const readTripsSchema = zod_1.z.object({
    body: zod_1.z.undefined(),
    query: zod_1.z.object({
        engineId: zod_1.z.string().optional(),
        driverId: zod_1.z.coerce.number().int().optional(),
        status: zod_1.z.string().trim().transform(val => val.toUpperCase()).pipe(zod_1.z.enum(tripStatusValues)).optional(),
        // fromStartDate: z.iso.datetime().optional(),
        // toStartDate: z.iso.datetime().optional(),
        fromStartDate: zod_1.z.coerce.date().optional(),
        toStartDate: zod_1.z.coerce.date().optional(),
        fleetManagerId: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().default(10),
        page: zod_1.z.coerce.number().int().positive().default(1),
        orderBy: zod_1.z.string().transform(val => val.toLowerCase()).pipe(zod_1.z.enum(["asc", "desc"])).default('asc')
    }).strict(),
    params: zod_1.z.object({}).strict()
});
exports.readTripsSchema = readTripsSchema;
