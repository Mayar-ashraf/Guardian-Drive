import { z } from "zod"
const carStatusValues = ["ACTIVE", "IN_TRIP", "DISABLED"] as const;
const updateCarSchema = z.object({
    body: z.object({
        plateNo: z.string().min(3),
        color: z.string().min(1),
        status: z.string().trim().transform(val => val.toUpperCase()).pipe(z.enum(carStatusValues))
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({
        engineId: z.string().min(1)
    }).strict()
})
export { updateCarSchema }