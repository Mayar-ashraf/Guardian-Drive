import { prisma } from "../lib/prisma"
import express from "express";
import { Role } from "../../generated/prisma/enums";

export const createTowingRequest = async (req: express.Request, res: express.Response) => {
    try {
        const caller = req?.user;
        const role = caller?.role;
        if (!caller) {
            return res.status(401).json({ message: "missing or invalid token" });
        }
        if (role == Role.DRIVER || role == Role.ADMIN) {
            return res.status(403).json({ message: "You are unauthorized to make this request" });
        }

        const { tripId, towingCompany, status } = req.validated?.body;
        const request = await prisma.towingRequest.create({
            data: {
                tripId,
                towingCompany,
                status: status || "PENDING",
            },

        });
        return res.status(201).json({
            message: "Request created succsefully",
            data: request
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "error creating towing request" });
    }
};
export const getTowingRequests = async (req: express.Request, res: express.Response) => {
    try {

        const caller = req?.user;
        const role = caller?.role;
        if (!caller) {
            return res.status(401).json({ message: "missing or invalid token" });
        }
        if (role == Role.DRIVER) {
            return res.status(403).json({ message: "You are unauthorized to make this request" });
        }
        const filters = req.validated?.query || {};
        const requests = await prisma.towingRequest.findMany({
            where: {
                ...(filters.status && { status: filters.status }),
                ...(filters.towingCompany && { towingCompany: filters.towingCompany }),
                ...(filters.completionTime && { completionTime: filters.completionTime }),
                ...(filters.requestTime && { requestTime: filters.requestTime }),
                ...(filters.car && {
                    trip: {
                        car: {
                            engineId: filters.car,
                        },
                    },
                }),
            },
            orderBy: {
                requestTime: "desc",
            },

            include: {
                trip: true,
            },
        });

        return res.status(200).json({
            message: "Towing requests fetched successfully",
            data: requests,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error getting towing requests" });
    }
};
export const gettowingRequestbyID = async (req: express.Request, res: express.Response) => {
    try {
        const caller = req?.user;
        const role = caller?.role;
        if (!caller) {
            return res.status(401).json({ message: "missing or invalid token" });

        }
        if (role == Role.DRIVER) {
            return res.status(403).json({ message: "you are not authorized to make this request" });
        }
        const id = req.validated?.params.towingRequestId;

        const request = await prisma.towingRequest.findUnique({
            where: {
                requestId: id,

            },
            include: {
                trip: true,
            }
        });
        if (!request) {
            return res.status(404).json({ message: "Towing request not found" });
        }
        return res.status(200).json(request);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error getting towing request" });
    }
};

