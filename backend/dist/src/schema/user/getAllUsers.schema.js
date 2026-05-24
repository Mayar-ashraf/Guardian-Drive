"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../generated/prisma/enums");
exports.getAllUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        role: zod_1.z.nativeEnum(enums_1.Role).optional(),
        email: zod_1.z.string()
            .min(1, "Email cannot be empty")
            .optional(),
        name: zod_1.z.string()
            .min(1, "Name cannot be empty")
            .optional()
    }).strict()
});
