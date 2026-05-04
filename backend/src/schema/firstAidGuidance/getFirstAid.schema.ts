import { z } from "zod";
import { alertIdSchema } from "../alert";
import { getAlertById } from "../../controllers/alert.controller";

export const getFirstAidSchema = z.object({
    params: getAlertById,
    query: z.object({}).strict()
});