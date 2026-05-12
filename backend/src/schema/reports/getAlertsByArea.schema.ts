import { z } from "zod"
export const getAlertsByAreaSchema = z.object({
    body: z.object({}).strict(),
    query: z.object({
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
    }).strict(),
    params: z.object({}).strict()
})