"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAlertSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../generated/prisma/enums");
// ================= UPDATE =================
exports.UpdateAlertSchema = zod_1.z.object({
    params: zod_1.z.object({
        alertId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(enums_1.alertStatus).optional(),
        stoppedLocationId: zod_1.z.number().int().positive().optional(),
        firstAidGuidance: zod_1.z.string().optional(),
    }).refine((data) => data.status !== undefined || data.stoppedLocationId !== undefined, { message: "At least one field must be provided" }),
});
