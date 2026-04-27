import z from "zod";
import { tripIdParamSchema } from "../trips/tripIdParam.schema";

export const getTripLocationSchema = z.object({
    params: tripIdParamSchema,
    query: z.object({}).strict(),
});
