import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt";
async function signup(req: any, res: any) {
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
export { signup }