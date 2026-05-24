"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsPerDriverSchema = void 0;
const zod_1 = require("zod");
exports.alertsPerDriverSchema = zod_1.z.object({
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive()
    }),
    query: zod_1.z.object({
        from: zod_1.z.coerce.date(),
        to: zod_1.z.coerce.date()
    }).refine((data) => data.from <= data.to, {
        message: "'from' date must be before 'to' date",
        path: ["to"]
    })
});
