"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGuidanceSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../generated/prisma/enums");
exports.CreateGuidanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        condition: zod_1.z.enum(enums_1.ConditionType),
        severity: zod_1.z.enum(enums_1.ConditionSeverity),
        description: zod_1.z.string(),
        specificAction: zod_1.z.string().optional()
    })
});
