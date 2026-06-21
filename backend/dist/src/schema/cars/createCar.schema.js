"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCarSchema = exports.carStatusValues = void 0;
const zod_1 = require("zod");
exports.carStatusValues = ["ACTIVE", "IN_TRIP", "DISABLED"];
exports.createCarSchema = zod_1.z.object({
    body: zod_1.z.object({
        engineId: zod_1.z.string().min(1),
        plateNo: zod_1.z.string().min(3),
        color: zod_1.z.string().min(1),
        status: zod_1.z
            .string()
            .trim()
            .transform(val => val.toUpperCase())
            .pipe(zod_1.z.enum(exports.carStatusValues))
            .optional(),
    }).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({}).strict(),
});
