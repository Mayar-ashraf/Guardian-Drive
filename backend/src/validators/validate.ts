// middleware/validate.ts
import { ZodObject, ZodError, z } from "zod";
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            validated?: {
                body?: any;
                query?: any;
                params?: any;
            };
        }
    }
}

export const validate =
    (schema: ZodObject<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const parsed = schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                req.validated = parsed;
                next();
            } catch (err: any) {
                if (err instanceof ZodError) {
                    return res.status(400).json({
                        message: "Validation failed",
                        errors: err.issues.map((e) => ({
                            field: e.path.join("."),
                            message: e.message,
                        })),
                    });
                }

                console.error(err);

                return res.status(500).json({
                    message: "Internal Server Error",
                });
            }
        };

export const tripIdParamSchema = z.object({
    tripId: z.string() 
    .regex(/^\d+$/, "tripId must be a valid integer") // check if string of didgits 
    .transform(Number) // then convert to number
});

export const gpsSchema = z.object({
  latitude: z.coerce.number().refine((val) => !isNaN(val), {
    message: "Latitude must be a valid number",
  }),
  longitude: z.coerce.number().refine((val) => !isNaN(val), {
    message: "Longitude must be a valid number",
  }),
});

export const sendTripLocationSchema = z.object({
    params: tripIdParamSchema,
    body: gpsSchema,
});

export type tripIdParams = z.infer<typeof tripIdParamSchema>;
export type gpsBody = z.infer<typeof gpsSchema>;
export type sendTripLocationDTO = z.infer<typeof sendTripLocationSchema>;