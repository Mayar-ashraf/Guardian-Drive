"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromToDateSchema = void 0;
const zod_1 = require("zod");
exports.fromToDateSchema = zod_1.z.object({
    params: zod_1.z.object({}).strict(),
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({
        from: zod_1.z.coerce.date("A valid 'from' date is required"),
        to: zod_1.z.coerce.date("A valid 'to' date is required")
    }).refine((data) => data.from <= data.to, {
        message: "'from' date must be before 'to' date",
        path: ["to"]
    }).strict()
});
