// middleware/validate.ts
import { ZodObject, ZodError } from "zod";
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

                // ❌ Not a Zod error → real server error
                console.error(err);

                return res.status(500).json({
                    message: "Internal Server Error",
                });
            }
        };