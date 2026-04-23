import { Role, tripStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden, sendNotFound, sendError, sendNoContent, sendCreated, sendSuccess } from "../utils/HTMLresponses";
import { carStatus } from './../../generated/prisma/enums';
import { TripFieldRefs } from './../../generated/prisma/models/Trip';
import { templateLiteral } from "zod";
import { is, tr } from "zod/locales";
import { error } from "node:console";

async function createTrip(req: Request, res: Response) {
    try {
        //  const { startPoint, destPoint, plannedStartTime, location, driverId, engineId, fleetManagerId } = req.body
        // const user = req.user
        // const data: any = {
        //     startPoint,
        //     destPoint,
        //     plannedStartTime,
        //     status: tripStatus.PLANNED,
        //     location,
        //     fleetManagerId
        // };
        const dataFromZod: any = req.body

        // change after zod
        if (dataFromZod.driverId !== undefined) {
            // data.driverId = Number(driverId);
            const driver = await prisma.driver.findUnique({
                where: {
                    // id: driverId
                    id: dataFromZod.driverId
                }
            })
            if (!driver) {

                return res.status(422).json({ message: "Driver doesn't exist" })
            }
        }
        const assignedFleetManager = await prisma.user.findUnique({
            where: {
                // id: fleetManagerId
                id: dataFromZod.fleetManagerId
            }
        })
        if (!assignedFleetManager || assignedFleetManager.role !== "FLEET_MANAGER") {

            return res.status(422).json({ message: "Fleet manager doesn't exist" })
        }
        // if (dataFromZod.fleetManagerId !== undefined) {
        //     //data.fleetManagerId = Number(fleetManagerId);
        //     const assignedFleetManager = await prisma.user.findUnique({
        //         where: {
        //             // id: fleetManagerId
        //             id: dataFromZod.fleetManagerId
        //         }
        //     })
        //     if (!assignedFleetManager || assignedFleetManager.role !== "FLEET_MANAGER") {

        //         return res.status(422).json({ message: "Fleet manager doesn't exist" })
        //     }
        // }
        // if (engineId !== undefined) {
        //     data.engineId = engineId;
        // }


        const trip = await prisma.trip.create({
            data: {
                ...dataFromZod,
                status: tripStatus.PLANNED
            }
        });

        return res.status(201).json({ message: "Trip created successfully", trip });
    } catch (error) {
        console.error("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" })
    }

}
async function readTrips(req: Request, res: Response) {

    try {
        const user = req.user
        const { engineId, driverId, status, fromDate, toDate, fleetManagerId } = req.query
        const whereConditions: any = {}
        // change after adding validators
        const limit = parseInt(req.query.limit_by as string, 10) || 10
        const page = parseInt(req.query.page as string, 10) || 1
        const skip = (page - 1) * limit;
        //check after validator
        const orderBy =
            req.query.orderBy === "asc" ? "asc" : "desc";
        if (req.query.engineId) {
            whereConditions.engineId = req.query.engineId
        }
        if (req.query.driverId) {
            //redo after validation
            whereConditions.driverId = Number(req.query.driverId)
        }
        if (req.query.fleetManagerId) {
            //redo after validation
            whereConditions.fleetManagerId = Number(req.query.fleetManagerId)
        }
        if (req.query.status) {
            whereConditions.status = req.query.status
        }
        const startTimeFilter: any = {};

        if (typeof req.query.fromStartDate === "string") {
            startTimeFilter.gte = new Date(req.query.fromStartDate);
        }

        if (typeof req.query.toStartDate === "string") {
            startTimeFilter.lte = new Date(req.query.toStartDate);
        }

        if (Object.keys(startTimeFilter).length > 0) {
            whereConditions.startTime = startTimeFilter;
        }
        let trips;

        if (user?.role === "DRIVER") {
            whereConditions.driverId = user?.userId

        }

        trips = await prisma.trip.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: {
                startTime: orderBy
            }

        })
        const total = await prisma.trip.count({
            where: whereConditions
        });

        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            trips
        })

    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
}

async function getTripLocation(req: Request, res: Response) {
    try {
        const tripId = Number(req.params.tripId);
        const user = req.user;

        if (isNaN(tripId)) {
            return res.status(400).json({ message: "Invalid tripId" });
        }

        const trip = await prisma.trip.findUnique({
            where: { tripId },
            include: {
                location: {
                    orderBy: { time: "desc" },
                    take: 1, // only latest location
                },
            },
        });


        if (!trip) {
            return res.status(404).json({ message: "Trip not found." });
        }

        const isADMIN = (user?.role === "ADMIN");
        const isAuthorizedFleetManager = (user?.role === "FLEET_MANAGER" && trip.fleetManagerId === user.userId);
        const isAuthorizedDriver = (user?.role === "DRIVER" && trip.driverId === user.userId);

        if (!isADMIN && !isAuthorizedFleetManager && !isAuthorizedDriver) {
            return res.status(403).json({ message: "You are unauthorized to make this request" });
        }

        if (trip.location.length === 0) {
            return res.status(404).json({ message: "No locations found for this trip yet." });
        }

        res.json(trip.location[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


async function getTripHeatMap(req: Request, res: Response) {
    try {
        const tripId = Number(req.params.tripId);

        if (isNaN(tripId)) {
            return res.status(400).json({ message: "Invalid tripId" });
        }

        const trip = await prisma.trip.findUnique({
            where: { tripId },
            include: {
                location: {
                    orderBy: { time: "asc" },
                },
            },
        });

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.location.length === 0) {
            return res.status(404).json({ message: "No locations found for this trip yet." });
        }

        res.json(trip.location);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function getTripById(req: Request, res: Response) {
    try {
        const tripId = req.params.tripId
        const user = req.user

        const trip = await prisma.trip.findUnique({
            where: {
                tripId: parseInt(tripId as string)
            }
        })
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        if (user?.role === "DRIVER" && trip.driverId !== user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        return res.status(200).json({ trip });
    } catch (error) {
        console.error("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" })

    }

}
async function updateTrip(req: Request, res: Response) {
    try {
        const tripId = parseInt(req.params.tripId as string)
        const user = req.user
        const updates = req.body
        const allowedUpdates: any = {};

        if (user?.role === "FLEET_MANAGER") {
            const trip = await prisma.trip.update({
                where: { tripId: tripId },
                data: updates
            })
            return res.status(200).json({ trip });

        } else {
            //driver can only edit trip status which changes end and start time
            let trip = await prisma.trip.findUnique({
                where: {
                    tripId: tripId
                }
            })

            if (!trip) {
                return res.status(404).json({ message: "Trip not found" });
            }
            if (trip.driverId !== user?.userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            const currentTime = new Date();
            if (updates.status === tripStatus.ONGOING) {

                if (trip.status !== tripStatus.PLANNED) {
                    return res.status(409).json({ message: `Can't start a ${trip.status} trip` });

                }
                if (currentTime >= trip?.plannedStartTime) {
                    allowedUpdates.status = tripStatus.ONGOING;
                    allowedUpdates.startTime = currentTime;

                }
                else {
                    return res.status(409).json({ message: "Trip cannot be started before plannedStartTime" })
                }
            }

            else if (updates.status === tripStatus.COMPLETED) {
                if (trip.status !== tripStatus.ONGOING) {
                    return res.status(409).json({ message: "Trip must be ongoing to complete it" });
                }
                allowedUpdates.status = tripStatus.COMPLETED;
                allowedUpdates.endTime = currentTime;
            }
            trip = await prisma.trip.update({
                where: { tripId: tripId },
                data: allowedUpdates
            })
            return res.status(200).json({ trip });

        }



    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Trip not found" });
        }
        return res.status(500).json({ message: "Server Error" })

    }
}
async function deleteTrip(req: Request, res: Response) {
    try {
        const tripId = parseInt(req.params.tripId as string)
        await prisma.trip.delete({
            where: {
                tripId: tripId
            }
        })
        return res.status(204).send();

    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Trip not found" });
        }
        return res.status(500).json({ message: "Server Error" })

    }
}

export { createTrip, readTrips, getTripById, updateTrip, deleteTrip, getTripLocation }
