"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGuidanceSchema = void 0;
const zod_1 = require("zod");
exports.DeleteGuidanceSchema = zod_1.z.object({
    params: zod_1.z.object({
        guidanceId: zod_1.z.coerce.number().int().positive()
    })
});
