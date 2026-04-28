import { z } from "zod"
const deleteCarSchema = z.object({
    body: z.object({}).strict(),
    query: z.object({}).strict(),
    params: z.object({
        engineId: z.string().min(1)
    }).strict()
})
export { deleteCarSchema }
