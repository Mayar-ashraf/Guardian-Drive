import { z } from "zod"
const getDriverReportSchema = z.object({
    body: z.object({}).strict(),
    query: z.object({
        fromStartDate: z.iso.datetime().optional(),
        toStartDate: z.iso.datetime().optional(),
    }).strict(),
    params: z.object({
        driverId: z.coerce.number().int().positive(),
    }).strict()
})
export { getDriverReportSchema }