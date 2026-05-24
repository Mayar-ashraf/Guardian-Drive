"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCarsSchema = void 0;
const zod_1 = require("zod");
exports.getAllCarsSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({
        status: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        plateNo: zod_1.z.string().optional(),
    }).strict(),
    params: zod_1.z.object({}).strict(),
});
