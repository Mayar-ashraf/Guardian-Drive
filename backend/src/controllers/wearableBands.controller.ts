import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendError, sendNotFound, sendUnauthorized } from "../utils/HttpResponses";

export const getAllWearableBands = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { deviceId, driverId, isConnected, sensor, limit, page, orderBy} = req.validated!.query; // used ! instead of ? because validation ran, so validated should exist
        
        
    } catch (error) {
        console.error(error);
    }
}
export const getWearableBandById = async (req: Request, res: Response) => {
    try {
        const deviceId = req.validated!.params.deviceId;
        const wearableBand = await prisma.wearableBand.findUnique({ where: { deviceId } });
        const user = req.user;

        if (!wearableBand) {
            return sendNotFound(res, "Wearable Band Not Found.");
        }
        const isADMIN = (user?.role === "ADMIN");
        const isAuthorizedDriver = (user?.role === "DRIVER" && wearableBand.driverId === user.userId);
        console.log("REQ USER:", req.user);
        if (!isADMIN && !isAuthorizedDriver) {
            return sendUnauthorized(res, "You are unauthorized to access this wearable band");
        }

        return res.json({ wearableBand });
    } catch (error) {
        console.error(error);
        return sendError(res);
    }
}