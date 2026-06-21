"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserbyIDschema = void 0;
const zod_1 = require("zod");
exports.deleteUserbyIDschema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "User ID must be a number"),
    }).strict(),
    body: zod_1.z.object({
        newFleetManagerId: zod_1.z.number().optional(),
        newDriverId: zod_1.z.number().optional()
    })
        .strict()
        .refine((data) => !(data.newFleetManagerId && data.newDriverId), {
        message: "Provide only one reassignment ID, not both"
    })
});
