import { z } from "zod";
import { alertType, alertStatus } from "../../generated/prisma/enums";

// ================= CREATE =================
export const CreateAlertSchema = z.object({
    body: z.object({
        type: z.enum(alertType),
        tripId: z.number().int().positive(),
        triggeredLocationId: z.number().int().positive(),
        stoppedLocationId: z.number().int().positive().optional(),
        heartRange: z.string(), // required for the health event creation
        temp: z.number(),
        firstAidGuidance: z.string().optional(),
    })
});

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

export const getAlertByIdSchema = z.object({
    params: z.object({
        alertId: z.coerce.number().int().positive(),
    })
})

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;
export type FilterAlertInput = z.infer<typeof FilterAlertSchema>;