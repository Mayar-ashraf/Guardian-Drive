import z from "zod";
import { tripStatus } from "../../../generated/prisma/enums";

const SystemUpdateTripSchema = z.object({
    body: z.object({
        status: z.string().trim().transform(val => val.toUpperCase()).pipe(z.enum([tripStatus.CANCELLED])),
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({
        tripId: z.coerce.number().int().positive()
    }).strict()
})

export default SystemUpdateTripSchema;