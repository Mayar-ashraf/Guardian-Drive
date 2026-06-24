import { z } from "zod"
const deleteCarSchema = z.object({
  body: z.undefined(),
query: z.object({}).optional(),
    params: z.object({
        engineId: z.string().min(1)
    }).strict()
})
export { deleteCarSchema }
