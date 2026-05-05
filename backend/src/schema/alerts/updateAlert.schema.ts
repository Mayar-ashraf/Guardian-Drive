import { z } from "zod";
import { alertStatus } from "../../../generated/prisma/enums";

// ================= UPDATE =================
export const UpdateAlertSchema = z.object({
    params: z.object({
        alertId: z.coerce.number().int().positive(),
    }),
    body: z.object({
        status: z.enum(alertStatus).optional(),
        stoppedLocationId: z.number().int().positive().optional(),
        firstAidGuidance: z.string().optional(),
    }).refine(
        (data) => data.status !== undefined || data.stoppedLocationId !== undefined,
        { message: "At least one field must be provided" }
    ),
});

export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;