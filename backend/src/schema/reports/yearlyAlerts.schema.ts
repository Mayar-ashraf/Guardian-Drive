import z from "zod";

export const yearlyAlertsSchema = z.object({
    query: z.object({
        fromYear: z.coerce.number("'from' year must be a valid number").positive("'from' year must be positive").int("'from' year must be integer"),
        toYear: z.coerce.number("'to' year must be a valid number").positive("'to' year must be positive").int("'to' year must be integer")
    }).refine(
        (val) => val.fromYear <= val.toYear,
        {
            message: "'from' year must be before 'to' year",
            path: ["toYear"]
        }
    ).strict()
});