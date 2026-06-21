"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupSchema = void 0;
const zod_1 = require("zod");
const RoleEnum = zod_1.z.enum(["ADMIN", "DRIVER", "FLEET_MANAGER"]);
const SignupSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.email().trim().toLowerCase(),
        password: zod_1.z.string().min(8).regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
            .regex(/[0-9]/, { message: "Password must contain at least one number" })
            .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
        fName: zod_1.z.string().min(2).trim(),
        lName: zod_1.z.string().min(2).trim(),
        phone: zod_1.z.array(zod_1.z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number").trim()),
        address: zod_1.z.string().trim(),
        role: RoleEnum,
        drivingLicense: zod_1.z.string().optional()
    }).superRefine((data, ctx) => {
        if (data.role === "DRIVER" && !data.drivingLicense) {
            ctx.addIssue({
                path: ["drivingLicense"],
                code: "custom",
                message: `Driver must have driving license.`,
            });
        }
    }),
    query: zod_1.z.object({}),
    params: zod_1.z.object({}),
});
exports.SignupSchema = SignupSchema;
