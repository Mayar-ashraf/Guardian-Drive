"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTripSchema = void 0;
const zod_1 = require("zod");
const deleteTripSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({
        tripId: zod_1.z.coerce.number().int().positive()
    }).strict()
});
exports.deleteTripSchema = deleteTripSchema;
