import { Role, tripStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden, sendNotFound, sendError, sendNoContent, sendCreated, sendSuccess } from "../utils/HttpResponses";
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
        const dataFromZod: any = req.validated?.body

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
        if (dataFromZod.engineId !== undefined) {
            const car = await prisma.car.findUnique({
                where: {
                    engineId: dataFromZod.engineId
                }
            })
            if (!car) {
                return res.status(422).json({ message: "Car doesn't exist" })
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
        //do same for car


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
        // const { engineId, driverId, status, fromDate, toDate, fleetManagerId } = req.query
        const query = req.validated?.query
        const { limit, orderBy, page } = query
        const skip = (page - 1) * limit;
        const whereConditions = {
            ...(req.validated?.query.engineId && { engineId: req.validated?.query.engineId }),
            ...(req.validated?.query.driverId && { driverId: req.validated?.query.engineId }),
            ...(req.validated?.query.fleetManagerId && { fleetManagerId: req.validated?.query.engineId }),
            ...(req.validated?.query.status && { status: req.validated?.query.status })

        }
        const startTimeFilter: any = {};

        if (req.validated?.query.fromStartDate) {
            startTimeFilter.gte = req.validated?.query.fromStartDate;
        }

        if (req.validated?.query.toStartDate) {
            startTimeFilter.lte = req.validated?.query.toStartDate;
        }

        if (Object.keys(startTimeFilter).length > 0) {
            whereConditions.plannedStartTime = startTimeFilter;
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
                startTime: req.validated?.query.orderBy
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
        const tripId = req.validated?.params.tripId
        const user = req.user

        const trip = await prisma.trip.findUnique({
            where: {
                tripId: tripId
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
        const tripId = req.validated?.params.tripId
        const user = req.user
        const updates = req.validated?.body
        let allowedUpdates: any = {};

        if (user?.role === "FLEET_MANAGER") {

            if (updates.driverId !== undefined) {
                // data.driverId = Number(driverId);
                const driver = await prisma.driver.findUnique({
                    where: {
                        // id: driverId
                        id: updates.driverId
                    }
                })
                if (!driver) {

                    return res.status(422).json({ message: "Driver doesn't exist" })
                }
            }
            if (updates.engineId !== undefined) {
                const car = await prisma.car.findUnique({
                    where: {
                        engineId: updates.engineId
                    }
                })
                if (!car) {
                    return res.status(422).json({ message: "Car doesn't exist" })
                }
            }
            if (updates.fleetManagerId !== undefined) {
                const fleetManager = await prisma.user.findUnique({
                    where: {
                        id: updates.fleetManagerId
                    }
                })
                if (!fleetManager || fleetManager.role !== "FLEET_MANAGER") {
                    return res.status(422).json({ message: "Fleet Manager doesn't exist" })
                }
            }
            allowedUpdates = updates
            if (updates.status === "ONGOING") {
                allowedUpdates.startTime = updates.startTime ?? new Date();
            }
            if (updates.status === "COMPLETED") {
                allowedUpdates.endTime = updates.endTime ?? new Date();
            }
            const trip = await prisma.trip.update({
                where: { tripId: tripId },
                data: allowedUpdates
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
        const tripId = req.validated?.params.tripId
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
