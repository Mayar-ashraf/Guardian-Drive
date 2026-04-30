import {z} from "zod";
export const createTowingRequestSchema = z.object ({
    body : z.object({
        tripId:z.number(),
        towingCompany: z.string().min(2),
        status:z.enum(["PENDING","IN_PROGRES","COMPLETED"]).optional(),
    }).strict(),
    query: z.object({}).strict(),
    params: z.object({}).strict(),
});
