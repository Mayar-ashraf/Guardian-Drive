import { Role, tripStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden, sendNotFound, sendError, sendNoContent, sendCreated, sendSuccess, sendValidationError, sendBadRequest } from "../utils/HttpResponses";
import { carStatus } from '../../generated/prisma/enums';
import { TripFieldRefs } from '../../generated/prisma/models/Trip';
import { any, templateLiteral } from "zod";
import { is, tr } from "zod/locales";
import { error } from "node:console";
import { sendTripLocationDTO } from "../schema/location/sendTripLocation.schema";
import { send } from "node:process";

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
        if (new Date(dataFromZod.plannedStartTime) < new Date()) {
            return res.status(400).json({
                message: "plannedStartTime cannot be in the past"
            });
        }
        if (dataFromZod.driverId !== undefined) {
            const driver = await prisma.driver.findUnique({
                where: {
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
                id: dataFromZod.fleetManagerId
            }
        })
        if (!assignedFleetManager || assignedFleetManager.role !== "FLEET_MANAGER") {

            return res.status(422).json({ message: "Fleet manager doesn't exist" })
        }

        const tripDuplicate = await prisma.trip.findFirst({
            where: {
                driverId: dataFromZod.driverId,
                plannedStartTime: dataFromZod.plannedStartTime
            }
        })
        if (tripDuplicate) {
            return res.status(409).json({ message: "Trip already exists for this driver at the given planned start time" })
        }
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
        const validatedQuery = req.validated?.query
        const { limit, orderBy, page } = validatedQuery
        const skip = (page - 1) * limit;
        if (
            validatedQuery.fromStartDate &&
            validatedQuery.toStartDate &&
            new Date(validatedQuery.fromStartDate) > new Date(validatedQuery.toStartDate)
        ) {
            return res.status(400).json({
                message: "fromStartDate cannot be after toStartDate"
            });
        }
        const whereConditions = {
            ...(validatedQuery.engineId && { engineId: validatedQuery.engineId }),
            ...(validatedQuery.driverId && { driverId: validatedQuery.engineId }),
            ...(validatedQuery.fleetManagerId && { fleetManagerId: validatedQuery.engineId }),
            ...(validatedQuery.status && { status: validatedQuery.status })

        }
        const startTimeFilter: any = {};

        if (validatedQuery.fromStartDate) {
            startTimeFilter.gte = validatedQuery.fromStartDate;
        }

        if (validatedQuery.toStartDate) {
            startTimeFilter.lte = validatedQuery.toStartDate;
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
                startTime: validatedQuery.orderBy
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
        const tripId = req.validated?.params.tripId;
        const user = req.user;

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
            return sendNotFound(res, "Trip not found.");
        }

        const isADMIN = (user?.role === "ADMIN");
        const isAuthorizedFleetManager = (user?.role === "FLEET_MANAGER" && trip.fleetManagerId === user.userId);
        const isAuthorizedDriver = (user?.role === "DRIVER" && trip.driverId === user.userId);

        if (!isADMIN && !isAuthorizedFleetManager && !isAuthorizedDriver) {
            return sendForbidden(res, "You are unauthorized to access this trip");
        }

        if (trip.status === "PLANNED") {
            return sendBadRequest(res, "Trip has not started yet.");
        }

        if (trip.status === "CANCELLED") {
            return sendBadRequest(res, "Trip was cancelled and has no location data.");
        }

        res.json({
            "latitude": trip.location[0].latitude,
            "longitude": trip.location[0].longitude,

        });

    } catch (error) {
        console.error(error);
        sendError(res);
    }
}


async function getTripHeatMap(req: Request, res: Response) {
    try {
        const tripId = req.validated?.params.tripId;
        const user = req.user;

        const trip = await prisma.trip.findUnique({
            where: { tripId },
            include: {
                location: {
                    orderBy: { time: "asc" },  // locations sorted ascendingly
                },
            },
        });

        if (!trip) {
            return sendNotFound(res, "Trip not found.")
        }

        const isADMIN = (user?.role === "ADMIN");
        const isAuthorizedFleetManager = (user?.role === "FLEET_MANAGER" && trip.fleetManagerId === user.userId);
        const isAuthorizedDriver = (user?.role === "DRIVER" && trip.driverId === user.userId);

        if (!isADMIN && !isAuthorizedFleetManager && !isAuthorizedDriver) {
            return sendUnauthorized(res, "You are unauthorized to access this trip");
        }

        if (trip.status === "PLANNED") {
            return sendBadRequest(res, "Trip has not started yet.");
        }

        if (trip.status === "CANCELLED") {
            return sendBadRequest(res, "Trip was cancelled and has no location data.");
        }

        res.json(trip.location);

    } catch (error) {
        console.error(error);
        sendError(res);
    }
}

async function sendTripLocation(req: Request, res: Response) {
    try {
        const data = req.validated as sendTripLocationDTO;
        const tripId = data.params.tripId;
        const { latitude, longitude } = data.body;
        const user = req.user;

        const trip = await prisma.trip.findUnique({
            where: {
                tripId,
            }
        });
        if (!trip) {
            return sendNotFound(res, "Trip not found.")
        }

        if (trip.driverId !== user?.userId) {
            return sendUnauthorized(res, "You are unauthorized to send location updates for this trip");
        }
        if (trip.status !== "ONGOING") {
            return res.status(400).json({ message: "Can't add location to a non-active trip." });
            // sendValidationError()
        }

        const location = await prisma.location.create({
            data: {
                tripId,
                latitude,
                longitude
            }
        });
        // return res.status(201).json({ message: "Location sent successfully", location });
        return sendCreated(res, location, "Location sent successfully");

    } catch (error) {
        console.error(error);
        sendError(res);
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

            // i can assign to a diff fleet manager
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
            let trip = await prisma.trip.findUniqueOrThrow({
                where: {
                    tripId: tripId
                }
            })
            if (trip.fleetManagerId !== user.userId) {
                return res.status(403).json({ message: "Forbidden" });

            }

            trip = await prisma.trip.update({
                where: { tripId: tripId },
                data: allowedUpdates
            })
            return res.status(200).json({ trip });

        } else {
            //driver can only edit trip status which changes end and start time
            let trip = await prisma.trip.findUniqueOrThrow({
                where: {
                    tripId: tripId
                }
            })

            // if (!trip) {
            //     return res.status(404).json({ message: "Trip not found" });
            // }
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

export { createTrip, readTrips, getTripById, updateTrip, deleteTrip, getTripLocation, getTripHeatMap, sendTripLocation }
