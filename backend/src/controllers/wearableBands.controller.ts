import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendBadRequest, sendCreated, sendError, sendNotFound, sendSuccess, sendUnauthorized } from "../utils/HttpResponses";

export const getAllWearableBands = async (req: Request, res: Response) => {
    try {
        const { deviceId, driverId, isConnected, sensor, limit, page, orderBy } = req.validated!.query; // used ! instead of ? because validation ran, so validated should exist
        const normalizedSensor = sensor?.toLowerCase();
        const whereConditions = {
            ...(deviceId && { deviceId }),
            ...(driverId && { driverId }),
            ...(isConnected !== undefined && { isConnected }), // !==undefined because if value = false, it will be ignored
            ...(normalizedSensor && { sensorList: { has: normalizedSensor } }), // store in database all lower cases
        };
        const skip = (page - 1) * limit;
        const wearableBands = await prisma.wearableBand.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                deviceId: orderBy
            }
        });
        if (wearableBands.length === 0) { // wearableBands can be [] or [value1, value2,...]
            return sendNotFound(res, "No wearable bands found.");
        }

        return sendSuccess(res, { message: "Success", data: wearableBands });

    } catch (error) {
        return sendError(res);
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
        // console.log("REQ USER:", req.user);
        if (!isADMIN && !isAuthorizedDriver) {
            return sendUnauthorized(res, "You are unauthorized to access this wearable band");
        }

        return res.json({ wearableBand });
    } catch (error) {
        return sendError(res);
    }
}

export const addWearableBand = async (req: Request, res: Response) => {
    try {
        const body = req.validated!.body;

        if (body.driverId) { // check if driver with this driver id exists 

            const driver = await prisma.driver.findUnique({
                where: {
                    id: body.driverId
                },
                include: {
                    wearableBand: true
                }
            });
            if (!driver) {
                return sendBadRequest(res, "Driver with this driver id does not exist.");
            }
            if(driver.wearableBand){
                return sendBadRequest(res, "Driver with this driver id already owns a wearable band.");
            }
        }
        const addedWearableBand = await prisma.wearableBand.create(({
            data: body
        }));

        return sendCreated(res, addedWearableBand, "Wearable Band added successfully");
    } catch (error: any) {
        if (error.code === "P2002") {
            return sendBadRequest(res, "Band already exists.");
        }
        return sendError(res);
    }
}

export const deleteWearableBand = async (req: Request, res: Response) => {
    try {

        const deviceId = req.validated!.params.deviceId;
        await prisma.wearableBand.delete({
            where: { deviceId: deviceId }
        });
        return sendSuccess(res, "Wearable Band deleted successully");
    } catch (error: any) {
        if (error.code === "P2025") {
            return sendNotFound(res, "Wearable band not found");
        }
        console.error(error);
        return sendError(res);
    }
}

export const updateWearableBand = async (req: Request, res: Response) => {
    try {
        const body = req.validated!.body;
        const deviceId = req.validated!.params.deviceId;

        if(body.driverId){
            const driver = await prisma.driver.findUnique({
                where: {
                    id: body.driverId
                },
                include: {
                    wearableBand: true
                }
            });
            if (!driver) {
                return sendBadRequest(res, "Driver with this driver id does not exist.");
            }
            if(driver.wearableBand && driver.wearableBand.deviceId !== deviceId){
                return sendBadRequest(res, "Driver with this driver id already owns a wearable band.");
            }
        }
        await prisma.wearableBand.update({
            where: {
                deviceId: deviceId
            },
            data: req.validated!.body
        });
        return sendSuccess(res, "Wearable band updated successfully");

    } catch (error: any) {
        if (error.code === "P2025") {
            return sendError(res, "Wearable Band not found.");
        }
        return sendError(res);
    }
}