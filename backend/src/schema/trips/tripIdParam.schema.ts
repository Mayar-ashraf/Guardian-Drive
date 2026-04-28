import { z } from "zod";

export const tripIdParamSchema = z.object({
    tripId: z.coerce.number("Trip Id must be a valid number")
        .int("Trip Id must be an integer")
        .positive("Trip Id must be positive")
}).strict();