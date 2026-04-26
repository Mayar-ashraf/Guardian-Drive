import { z } from "zod"
const RoleEnum = z.enum(["ADMIN", "DRIVER", "FLEET_MANAGER"]);
const SignupSchema = z.object({

    body: z.object({
        email: z.email().trim().toLowerCase(),
        password: z.string().min(8).regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
            .regex(/[0-9]/, { message: "Password must contain at least one number" })
            .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
        fName: z.string().min(2).trim(),
        lName: z.string().min(2).trim(),
        phone: z.array(z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number").trim()),
        address: z.string().trim(),
        role: RoleEnum,
        drivingLicense: z.string().optional()
    }).superRefine((data, ctx) => {
        if (data.role === "DRIVER" && !data.drivingLicense) {
            ctx.addIssue({
                path: ["drivingLicense"],
                code: "custom",
                message: `Driver must have driving license.`,
            })
        }
    }),
    query: z.object({}),
    params: z.object({}),

})

export { SignupSchema }