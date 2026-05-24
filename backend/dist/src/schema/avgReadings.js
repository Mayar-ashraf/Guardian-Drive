"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverAvgReadingsSchema = exports.createAvgReadingsSchema = void 0;
// src/validators/avgHealthReadings.validator.ts
const zod_1 = require("zod");
exports.createAvgReadingsSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive()
    }),
    body: zod_1.z.object({
        tripId: zod_1.z.number().int().positive(),
        avgHeartRate: zod_1.z.number().positive("avgHeartRate must be positive")
            .max(300, "avgHeartRate out of realistic range"),
        avgSpo2: zod_1.z
            .number().min(50, "avgSpo2 out of realistic range")
            .max(100, "avgSpo2 cannot exceed 100%"),
        avgTemp: zod_1.z
            .number().min(30, "avgTemp out of realistic range")
            .max(45, "avgTemp out of realistic range"),
    })
});
exports.getDriverAvgReadingsSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive()
    }),
});
