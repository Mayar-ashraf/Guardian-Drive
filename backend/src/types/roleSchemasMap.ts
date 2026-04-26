import { ZodObject, ZodRawShape } from "zod";
export type Role = "DRIVER" | "FLEET_MANAGER" | "ADMIN";
export type RoleSchemaMap = Partial<Record<
    Role,
    ZodObject<ZodRawShape>
>>;