import { z } from "zod";

export const getMedicalRecordByIdSchema = z.object({
    params: z.object({
        driverId: z.coerce.number().int().positive()
    })
})
