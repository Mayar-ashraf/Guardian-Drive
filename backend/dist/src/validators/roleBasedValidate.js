"use strict";
// src/middlewares/validateRoleBased.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoleBased = void 0;
const validateRoleBased = (schemas) => {
    return (req, res, next) => {
        var _a;
        try {
            const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            const schema = schemas[role];
            if (!schema) {
                return res.status(403).json({ message: "Forbidden role" });
            }
            req.validated = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (err) {
            return res.status(400).json({
                message: "Validation error",
                errors: err.errors,
            });
        }
    };
};
exports.validateRoleBased = validateRoleBased;
