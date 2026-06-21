"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmergencyServiceRequestByIdSchema = void 0;
const zod_1 = require("zod");
const getEmergencyServiceRequestByIdSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        requestId: zod_1.z.coerce.number().positive().int()
    }).strict()
});
exports.getEmergencyServiceRequestByIdSchema = getEmergencyServiceRequestByIdSchema;
