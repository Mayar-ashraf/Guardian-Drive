"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTowingRequestSchema = exports.updateTowingRequestSchema = exports.getTowingRequestByIdSchema = exports.getTowingRequestsSchema = exports.createTowingRequestSchema = void 0;
const zod_1 = require("zod");
exports.createTowingRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        tripId: zod_1.z.number(),
        alertId: zod_1.z.number(),
        towingCompany: zod_1.z.string().min(2),
        status: zod_1.z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"]).optional(),
    }).strict(),
    query: zod_1.z.object({}).strict(),
    params: zod_1.z.object({}).strict(),
});
exports.getTowingRequestsSchema = zod_1.z.object({
    query: zod_1.z.object({
        car: zod_1.z.string().optional(),
        towingCompany: zod_1.z.string().optional(),
        status: zod_1.z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"]).optional(),
        requestTime: zod_1.z.coerce.date().optional(),
        completionTime: zod_1.z.coerce.date().optional(),
    }).strict(),
    body: zod_1.z.object({}).strict(),
    params: zod_1.z.object({}).strict(),
});
exports.getTowingRequestByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        towingRequestId: zod_1.z.coerce.number(),
    }).strict(),
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict(),
});
exports.updateTowingRequestSchema = zod_1.z.object({
    params: zod_1.z.object({
        towingRequestId: zod_1.z.coerce.number(),
    }).strict(),
    body: zod_1.z.object({
        towingCompany: zod_1.z.string().optional(),
        status: zod_1.z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"]).optional(),
        completionTime: zod_1.z.coerce.date().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    })
        .strict(),
    query: zod_1.z.object({}).strict(),
});
exports.deleteTowingRequestSchema = zod_1.z.object({
    params: zod_1.z.object({
        towingRequestId: zod_1.z.coerce.number(),
    }).strict(),
    body: zod_1.z.object({}).strict(),
    query: zod_1.z.object({}).strict(),
});
