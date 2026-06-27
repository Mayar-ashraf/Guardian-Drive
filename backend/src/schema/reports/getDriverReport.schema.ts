import { z } from "zod"
const getDriverReportSchema = z.object({
    query: z.object({
        fromStartDate: z.iso.datetime().optional(),
        toStartDate: z.iso.datetime().optional(),
    }).strict(),
    params: z.object({
        driverId: z.coerce.number().int().positive(),
    }).strict(),
    body: z.undefined(),
})
export { getDriverReportSchema }