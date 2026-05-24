"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmergencyServiceRequestSchema = void 0;
const zod_1 = require("zod");
const createEmergencyServiceRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        requestTime: zod_1.z.iso.datetime().optional(),
        phone: zod_1.z.string().min(1),
        hospitalAssigned: zod_1.z.string().min(1),
        alertId: zod_1.z.coerce.number().positive().int(),
    }).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({}).strict()
});
exports.createEmergencyServiceRequestSchema = createEmergencyServiceRequestSchema;
