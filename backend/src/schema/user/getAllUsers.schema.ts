import { z } from "zod";
import { Role } from "../../../generated/prisma/enums";

export const getAllUsersSchema = z.object({
    query: z.object({
        role: z.nativeEnum(Role).optional(),

        email: z.string()
            .min(1, "Email cannot be empty")
            .optional(),

        name: z.string()
            .min(1, "Name cannot be empty")
            .optional()
    }).strict()
});