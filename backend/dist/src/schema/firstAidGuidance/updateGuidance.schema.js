"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGuidanceSchema = void 0;
const zod_1 = require("zod");
exports.UpdateGuidanceSchema = zod_1.z.object({
    params: zod_1.z.object({
        guidanceId: zod_1.z.coerce.number().int().positive()
    }),
    body: zod_1.z.object({
        description: zod_1.z.string().optional(),
        specificAction: zod_1.z.string().optional()
    })
});
