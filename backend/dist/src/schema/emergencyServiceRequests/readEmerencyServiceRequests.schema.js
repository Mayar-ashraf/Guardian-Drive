"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEmerencyServiceRequestsSchema = void 0;
const zod_1 = require("zod");
const readEmerencyServiceRequestsSchema = zod_1.z.object({
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({
        status: zod_1.z.string().trim().toUpperCase().pipe(zod_1.z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"])).optional(),
        fromRequestTime: zod_1.z.iso.datetime().optional(),
        toRequestTime: zod_1.z.iso.datetime().optional(),
        fromCompletionTime: zod_1.z.iso.datetime().optional(),
        toCompletionTime: zod_1.z.iso.datetime().optional(),
        hospitalAssigned: zod_1.z.string().trim().optional(),
        alertId: zod_1.z.coerce.number().positive().int().optional(),
        limit: zod_1.z.coerce.number().int().positive().default(10),
        page: zod_1.z.coerce.number().int().positive().default(1),
        orderBy: zod_1.z.string().transform(val => val.toLowerCase()).pipe(zod_1.z.enum(["asc", "desc"])).default('asc')
    }).strict(),
    params: zod_1.z.object({}).strict()
});
exports.readEmerencyServiceRequestsSchema = readEmerencyServiceRequestsSchema;
