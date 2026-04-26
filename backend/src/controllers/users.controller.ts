import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums";

export const getAllusers = async (req: express.Request, res: express.Response) => {

    const { email } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });

    }
    if (user.role !== Role.ADMIN) {
        return res.status(403).json({ message: "Access denied" });

    }
    else {
        const users = await prisma.user.findMany();
        return res.json(users);

    }
}
export const getUser = async (req: express.Request, res: express.Response) => {



}

// get driver info ( medical-info + user info + Avg Health Readings)
