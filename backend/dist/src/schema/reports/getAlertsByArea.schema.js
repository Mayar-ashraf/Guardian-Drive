"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlertsByAreaSchema = void 0;
const zod_1 = require("zod");
exports.getAlertsByAreaSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({
        from: zod_1.z.iso.datetime().optional(),
        to: zod_1.z.iso.datetime().optional(),
    }).strict(),
    params: zod_1.z.object({}).strict()
});
