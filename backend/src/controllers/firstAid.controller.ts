import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendError, sendForbidden, sendNotFound } from "../utils/HttpResponses";
async function getFirstAid(req: Request, res: Response) {
    try {
        const alertId = req.validated?.params.alertId;
        const user = req.user;
        const alert = await prisma.alert.findUnique({
            where: {
                alertId
            },
            include: {
                trip: true,
                healthEvent: true,
            },
        });
        if (!alert) {
            return sendNotFound(res, "Alert with this alert Id doesn't exist");

        }

        if (!alert.healthEvent) {
            return sendNotFound(res, "No Health event found for this alert");
        }

        const isADMIN = (user?.role === "ADMIN");
        const isAuthorizedFleetManager = (user?.role === "FLEET_MANAGER" && alert?.trip.fleetManagerId === user.userId);
        const isAuthorizedDriver = (user?.role === "DRIVER" && alert?.trip.driverId === user.userId);

        if (!isADMIN && !isAuthorizedFleetManager && !isAuthorizedDriver) {
            return sendForbidden(res, "You are unauthorized to make this request");
        }
        res.json({ First_Aid_Guidance: alert.healthEvent.firstAidGuidance});
        
    } catch (error) {
        sendError(res);
    }
};

export { getFirstAid };