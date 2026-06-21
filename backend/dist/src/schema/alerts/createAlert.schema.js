"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAlertSystemSchema = exports.CreateAlertSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../generated/prisma/enums");
// ================= CREATE =================
// create driver alert schema
exports.CreateAlertSchema = zod_1.z.object({
    body: zod_1.z.object({
        // required for alert creation
        type: zod_1.z.literal(enums_1.alertType.SOS, { message: "Alert type must be SOS for driver-triggered alerts" }),
        tripId: zod_1.z.number().int().positive(),
        triggeredLocationId: zod_1.z.number().int().positive(),
        stoppedLocationId: zod_1.z.number().int().positive().optional(),
        // required for the health event creation
        heartRate: zod_1.z.number().max(300),
        temp: zod_1.z.number().min(30).max(45),
        spo2: zod_1.z.number().min(50).max(100),
    })
});
// create system alert schema
exports.CreateAlertSystemSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        type: zod_1.z.literal(enums_1.alertType.HEALTH_ABNORMAL, { message: "Alert type must be HEALTH_ABNORMAL for System-triggered alerts" }),
        tripId: zod_1.z.number().int().positive(),
        triggeredLocationId: zod_1.z.number().int().positive(),
        stoppedLocationId: zod_1.z.number().int().positive().optional(),
        // required for the health event creation
        heartRate: zod_1.z.number().max(300),
        temp: zod_1.z.number().min(30).max(45),
        spo2: zod_1.z.number().min(50).max(100),
    })
});
