import { z } from "zod";
import { alertIdSchema } from "../alert";

export const getFirstAidSchema = z.object({
    params: alertIdSchema,
    query: z.object({}).strict()
});