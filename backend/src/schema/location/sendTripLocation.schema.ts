import z from "zod";
import { tripIdParamSchema } from "../trips/tripIdParam.schema";
import { gpsSchema } from "./gps.schema";

export const sendTripLocationSchema = z.object({
    params: tripIdParamSchema,
    body: gpsSchema,
});

export type sendTripLocationDTO = z.infer<typeof sendTripLocationSchema>;
