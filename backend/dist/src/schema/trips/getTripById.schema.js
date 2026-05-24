"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripByIdSchema = void 0;
const zod_1 = require("zod");
const getTripByIdSchema = zod_1.z.object({
    body: zod_1.z.undefined(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        tripId: zod_1.z.coerce.number().int().positive()
    }).strict()
});
exports.getTripByIdSchema = getTripByIdSchema;
