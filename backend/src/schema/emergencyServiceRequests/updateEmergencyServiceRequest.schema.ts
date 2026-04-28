import { z } from "zod"
const updateEmergencyServiceRequestSchema = z.object({
    body: z.object({
        phone: z.string().min(1).optional(),
        hospitalAssigned: z.string().min(1).optional(),
        status: z.string().trim().toUpperCase().pipe(z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"])).optional(),
        completionTime: z.iso.datetime().optional()
    }).strict().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    }),
    query: z.object({}).strict(),
    params: z.object({
        requestId: z.coerce.number().positive().int()

    }).strict()
})
export { updateEmergencyServiceRequestSchema }