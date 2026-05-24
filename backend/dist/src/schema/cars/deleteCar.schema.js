"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCarSchema = void 0;
const zod_1 = require("zod");
const deleteCarSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        engineId: zod_1.z.string().min(1)
    }).strict()
});
exports.deleteCarSchema = deleteCarSchema;
