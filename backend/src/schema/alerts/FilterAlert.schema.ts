import { alertStatus, alertType } from "../../../generated/prisma/enums";
import { z } from "zod";

// ================= FILTER =================
export const FilterAlertSchema = z.object({
    query: z.object({
        type: z.enum(alertType).optional(),
        status: z.enum(alertStatus).optional(),
        driverId: z.coerce.number().int().positive().optional(),  // coerce converts string query param to number
        engineId: z.string().optional(),
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(10),
        orderBy: z.enum(["asc", "desc"]).default("desc"),
    }).refine(
        (data) => {
            if (data.from && data.to) return data.from <= data.to;
            return true;
        },
        { message: "from date must be before to date", path: ["from"] }
    ),

});

export type FilterAlertInput = z.infer<typeof FilterAlertSchema>;