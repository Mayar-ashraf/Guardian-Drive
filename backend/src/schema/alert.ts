import { z } from "zod";
import { alertType, alertStatus } from "../../generated/prisma/enums";

// ================= CREATE =================
export const CreateAlertSchema = z.object({
    body: z.object({
        type: z.literal(alertType.SOS, { message: "Alert type must be SOS for driver-triggered alerts" }),
        tripId: z.number().int().positive(),
        triggeredLocationId: z.number().int().positive(),
        stoppedLocationId: z.number().int().positive().optional(),
        // required for the health event creation
        heartRate: z.number().max(300),
        temp: z.number().min(30).max(45),
        spo2: z.number().min(50).max(100),
        firstAidGuidance: z.string().optional(),
    })
});

export const CreateAlertSystemSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive(),
    }),
    body: z.object({
        type: z.literal(alertType.HEALTH_ABNORMAL, { message: "Alert type must be HEALTH_ABNORMAL for System-triggered alerts" }),
        tripId: z.number().int().positive(),
        triggeredLocationId: z.number().int().positive(),
        stoppedLocationId: z.number().int().positive().optional(),
        // required for the health event creation
        heartRate: z.number().max(300),
        temp: z.number().min(30).max(45),
        spo2: z.number().min(50).max(100),
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
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;
export type FilterAlertInput = z.infer<typeof FilterAlertSchema>;