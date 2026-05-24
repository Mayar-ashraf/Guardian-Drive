"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// middleware/validate.ts
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        req.validated = parsed;
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
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
exports.validate = validate;
