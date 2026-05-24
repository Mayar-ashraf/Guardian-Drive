"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarByIdSchema = void 0;
const zod_1 = require("zod");
exports.getCarByIdSchema = zod_1.z.object({
    body: zod_1.z.undefined(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        engineId: zod_1.z.string().min(1),
    }).strict(),
});
