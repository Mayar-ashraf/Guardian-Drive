"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverReportSchema = void 0;
const zod_1 = require("zod");
const getDriverReportSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({
        fromStartDate: zod_1.z.iso.datetime().optional(),
        toStartDate: zod_1.z.iso.datetime().optional(),
    }).strict(),
    params: zod_1.z.object({
        driverId: zod_1.z.coerce.number().int().positive(),
    }).strict()
});
exports.getDriverReportSchema = getDriverReportSchema;
