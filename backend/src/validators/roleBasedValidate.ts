// src/middlewares/validateRoleBased.ts

import { Request, Response, NextFunction } from "express";
import { RoleSchemaMap, Role } from "../types/roleSchemasMap"

export const validateRoleBased = (schemas: RoleSchemaMap) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = req.user?.role as Role;

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
        } catch (err: any) {
            return res.status(400).json({
                message: "Validation error",
                errors: err.errors,
            });
        }
    };
};