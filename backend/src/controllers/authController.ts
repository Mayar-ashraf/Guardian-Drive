import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt";
async function signup(req: any, res: any) {
    try {
        const { email, fName, lName, password, phone, address, role, drivingLicense } = req.body
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
                    fName: fName,
                    lName: lName,
                    password: hashedPassword,
                    phone: phone,
                    address: address,
                    role: role
                }
            })
            if (role === Role.DRIVER) {
                await prisma.driver.create({
                    data: {
                        drivingLicense: drivingLicense,
                        user: {
                            connect: { id: user.id }
                        }
                    }
                });
            }
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