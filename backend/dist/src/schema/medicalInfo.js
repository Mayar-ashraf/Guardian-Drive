"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicalRecordByIdSchema = exports.UpdateMedicalRecordSchema = exports.createMedicalInfoSchema = void 0;
const zod_1 = require("zod");
exports.createMedicalInfoSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive()
    }),
    body: zod_1.z.object({
        conditions: zod_1.z.array(zod_1.z.string()).default([]), // default for empty assignment - no value set
        medications: zod_1.z.array(zod_1.z.string()).default([]),
        avgTemp: zod_1.z.number().min(30).max(45),
        avgHeartRate: zod_1.z.number().positive().max(300),
        avgSpo2: zod_1.z.number().min(50).max(100),
        minTemp: zod_1.z.number().min(30).max(45).optional(),
        minHeartRate: zod_1.z.number().positive().max(300).optional(),
        minSpo2: zod_1.z.number().min(50).max(100).optional(),
        maxTemp: zod_1.z.number().min(30).max(45).optional(),
        maxHeartRate: zod_1.z.number().positive().max(300).optional(),
        maxSpo2: zod_1.z.number().min(50).max(100).optional(),
    })
});
exports.UpdateMedicalRecordSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive()
    }),
    body: zod_1.z.object({
        conditions: zod_1.z.array(zod_1.z.string()).optional(),
        medications: zod_1.z.array(zod_1.z.string()).optional(),
        avgTemp: zod_1.z.number().min(30).max(45).optional(),
        avgHeartRate: zod_1.z.number().positive().max(300).optional(),
        avgSpo2: zod_1.z.number().min(50).max(100).optional(),
        minTemp: zod_1.z.number().min(30).max(45).optional(),
        minHeartRate: zod_1.z.number().positive().max(300).optional(),
        minSpo2: zod_1.z.number().min(50).max(100).optional(),
        maxTemp: zod_1.z.number().min(30).max(45).optional(),
        maxHeartRate: zod_1.z.number().positive().max(300).optional(),
        maxSpo2: zod_1.z.number().min(50).max(100).optional(),
    })
});
exports.getMedicalRecordByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive()
    })
});
/*
// this may be used for both uodate and create schemas for both not to interfere with each other
// if update has empty field , create would fill it with [] and lose the saved data
*/ 
