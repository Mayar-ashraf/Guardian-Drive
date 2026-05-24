"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edituserbyIDschema = void 0;
const zod_1 = require("zod");
exports.edituserbyIDschema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "User ID must be a number"),
    }).strict(),
    body: zod_1.z.object({
        email: zod_1.z.string().email().optional(),
        fName: zod_1.z.string().min(2).optional(),
        lName: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().min(10).optional(),
        address: zod_1.z.string().optional(),
    }).strict()
        .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" }),
});
