import { z } from "zod";
import { alertType } from "../../../generated/prisma/enums";

// ================= CREATE =================

// create driver alert schema
export const CreateAlertSchema = z.object({
    body: z.object({
        // required for alert creation
        type: z.literal(alertType.SOS, { message: "Alert type must be SOS for driver-triggered alerts" }),
        tripId: z.number().int().positive(),
        triggeredLocationId: z.number().int().positive(),
        stoppedLocationId: z.number().int().positive().optional(),

        // required for the health event creation
        heartRate: z.number().max(300),
        temp: z.number().min(30).max(45),
        spo2: z.number().min(50).max(100),
    })
});

// create system alert schema
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
    })
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;