"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsPerConditionSchema = void 0;
const zod_1 = require("zod");
exports.alertsPerConditionSchema = zod_1.z.object({
    query: zod_1.z.object({
        from: zod_1.z.coerce.date(),
        to: zod_1.z.coerce.date()
    }).refine((data) => data.from <= data.to, {
        message: "'from' date must be before 'to' date",
        path: ["to"]
    })
});
