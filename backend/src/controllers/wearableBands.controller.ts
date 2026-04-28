import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendError, sendNotFound } from "../utils/HttpResponses";

export const getAllWearableBands = async (req:Request, res: Response) =>{
    
}
export const getWearableBandById = async (req: Request, res: Response) => {
    try {
        const deviceId = req.validated?.params.deviceId;
        console.log("deviceId:", deviceId, typeof deviceId);
        const wearableBand = await prisma.wearableBand.findUnique({ where: { deviceId } });
        if (!wearableBand) {
            return sendNotFound(res, "Wearable Band Not Found.");
        }
        return res.json({ wearableBand });
    } catch (error) {
        console.error(error);
        return sendError(res);
    }
}