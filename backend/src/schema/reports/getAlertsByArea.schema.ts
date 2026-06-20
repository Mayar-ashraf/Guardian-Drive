import { z } from "zod"
export const getAlertsByAreaSchema = z.object({
    body: z.object({}).optional(),
    query: z.object({
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
    }).strict(),
    params: z.object({}).strict()
})