import { prisma } from "../lib/prisma"
import { Request, Response} from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import {sendUnauthorized,sendForbidden,sendNotFound,sendError,sendNoContent,sendCreated,sendSuccess} from "../utils/HTMLresponses";

async function signup(req: Request, res: Response) {
    try {
        const { email, fname, lname, password, phone, address, role } = req.body
        const userExists = await prisma.user.findUnique({
            where: { email: email }
        })
        if (userExists) {
            return res.status(400).json({ message: "User already exists!" })
        }
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const user = await prisma.user.create({
                data: {
                    email: email,
                    fName: fname,
                    lName: lname,
                    password: hashedPassword,
                    phone: phone,
                    address: address,
                    role: role
                }
            })
            return res.status(201).json({ message: "User created successfully" });


        } catch (error: any) {
            //  return res.status(500).json({ message: "Server Error1" })
            console.error("FULL ERROR:", error);

            return res.status(500).json({
                message: "Server Error",
                error: error.message,
                stack: error.stack, // optional (remove later in production)
            });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server Error2" })
    }
}
async function login(req: Request, res: Response){
    try {
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({
            where: { email: email }
        })

        if (!user)  return sendUnauthorized(res, "Invalid email or password");

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return sendUnauthorized(res);

        // token generated from user id and role for later JWT Authorization
        const accessToken  = signAccessToken({ userId: user.id, role: user.role });

        const { password: _, ...safeUser } = user;  // to not return user password with response
        sendSuccess(res, { user: safeUser, accessToken}, "Login successful");

    }catch (error: any) {
        console.error("FULL ERROR:", error);
        return sendError(res) // can add ,error to send error too but thats not needed
    }
}

export { signup , login}