"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterAlertSchema = void 0;
const enums_1 = require("../../../generated/prisma/enums");
const zod_1 = require("zod");
// ================= FILTER =================
exports.FilterAlertSchema = zod_1.z.object({
    query: zod_1.z.object({
        type: zod_1.z.enum(enums_1.alertType).optional(),
        status: zod_1.z.enum(enums_1.alertStatus).optional(),
        driverId: zod_1.z.coerce.number().int().positive().optional(), // coerce converts string query param to number
        engineId: zod_1.z.string().optional(),
        from: zod_1.z.iso.datetime().optional(),
        to: zod_1.z.iso.datetime().optional(),
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
        orderBy: zod_1.z.enum(["asc", "desc"]).default("desc"),
    }).refine((data) => {
        if (data.from && data.to)
            return data.from <= data.to;
        return true;
    }, { message: "from date must be before to date", path: ["from"] }),
});
