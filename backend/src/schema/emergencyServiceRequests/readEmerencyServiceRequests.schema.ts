import { toUpperCase, z } from "zod"

const readEmerencyServiceRequestsSchema = z.object({
    body: z.undefined(),
    query: z.object({
        status: z.string().trim().toUpperCase().pipe(z.enum(["REQUESTED", "INPROGRESS", "COMPLETED"])).optional(),
        fromRequestTime: z.iso.datetime().optional(),
        toRequestTime: z.iso.datetime().optional(),
        fromCompletionTime: z.iso.datetime().optional(),
        toCompletionTime: z.iso.datetime().optional(),
        hospitalAssigned: z.string().trim().optional(),
        alertId: z.coerce.number().positive().int().optional(),
        limit: z.coerce.number().int().positive().default(10),
        page: z.coerce.number().int().positive().default(1),
        orderBy: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["asc", "desc"])).default('asc')
    }).strict(),
    params: z.object({}).strict()
})
export { readEmerencyServiceRequestsSchema }