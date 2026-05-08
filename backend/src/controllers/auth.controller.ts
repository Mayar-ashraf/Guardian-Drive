import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden, sendNotFound, sendError, sendNoContent, sendCreated, sendSuccess } from "../utils/HttpResponses";


async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email: email }
        })

        if (!user) return sendUnauthorized(res, "Invalid email or password");

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return sendUnauthorized(res);

        // token generated from user id and role for later JWT Authorization
        const accessToken = signAccessToken({ userId: user.id, role: user.role });

        const { password: _, ...safeUser } = user;  // to not return user password with response
        sendSuccess(res, { user: safeUser, accessToken }, "Login successful");

    } catch (error: any) {
        console.error("FULL ERROR:", error);
        return sendError(res) // can add ,error to send error too but thats not needed
    }
}

export { login }