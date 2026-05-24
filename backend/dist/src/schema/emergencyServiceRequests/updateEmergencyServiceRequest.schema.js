"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmergencyServiceRequestSchema = void 0;
const zod_1 = require("zod");
const updateEmergencyServiceRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(1).optional(),
        hospitalAssigned: zod_1.z.string().min(1).optional(),
        status: zod_1.z.string().trim().toUpperCase().pipe(zod_1.z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"])).optional(),
        completionTime: zod_1.z.iso.datetime().optional()
    }).strict().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    }),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        requestId: zod_1.z.coerce.number().positive().int()
    }).strict()
});
exports.updateEmergencyServiceRequestSchema = updateEmergencyServiceRequestSchema;
