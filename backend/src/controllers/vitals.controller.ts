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
/*{
    "driverId": 5,
    "heartRate": 82,
    "spo2": 98,
    "temp": 36.7
}
  every 2 sec  */
export const createVitals = async (req: Request, res: Response) => {

    try {

        const {
            driverId,
            heartRate,
            spo2,
            temp
        } = req.body;

        const trip = await prisma.trip.findFirst({
            where: {
                driverId,
                status: tripStatus.ONGOING
            }
        });

        if (!trip) {
            return res.status(404).json({
                message: "No ongoing trip found for this driver."
            });
        }

        const vitals = await prisma.vitals.create({
            data: {
                driverId,
                tripId: trip.tripId,
                heartRate,
                spo2,
                temp,
                createdAt: new Date()
            }
        });

        return res.status(201).json({
            message: "Vitals saved successfully.",
            data: vitals
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

export const getDriverLiveVitals = async (req: Request, res: Response) => {

    try {

        const driverId = Number(req.validated!.params.driverId);
        const user = req.user;

        const lastId = Number(req.query.lastId ?? 0);

        const trip = await prisma.trip.findFirst({

            where: {
                driverId,
                status: tripStatus.ONGOING
            },

            include: {
                driver: {
                    include: {
                        user: true
                    }
                }
            }

        });

        if (!trip) {
            return res.status(404).json({
                message: "No ongoing trip found."
            });
        }

        if (trip.fleetManagerId !== user?.userId) {
            return res.status(403).json({
                message: "Unauthorized."
            });
        }

        const vitals = await prisma.vitals.findMany({

            where: {
                tripId: trip.tripId,
                id: {
                    gt: lastId
                }
            },

            orderBy: {
                id: "asc"
            }

        });

        return res.status(200).json({

            tripId: trip.tripId,

            driverId,

            driverName: `${trip.driver?.user.fName} ${trip.driver?.user.lName}`,

            lastId:
                vitals.length > 0
                    ? vitals[vitals.length - 1].id
                    : lastId,

            vitals

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};
/*
{
    "tripId": 15,
    "driverId": 4,
    "driverName": "Ahmed Ali",
    "lastId": 35, // ashan frontend y get only the newest instead of loading all rows every 2 sec
    "vitals": [
        {
            "id": 31,
            "heartRate": 82,
            "spo2": 98,
            "temp": 36.6,
            "createdAt": "2026-06-28T12:00:00Z"
        },
        {
            "id": 32,
            "heartRate": 83,
            "spo2": 98,
            "temp": 36.7,
            "createdAt": "2026-06-28T12:00:02Z"
        }
    ]
}*/



export const getAllOnGoingTripVitals = async (
    req: Request,
    res: Response
) => {

    try {

        const user = req.user;

        const trips = await prisma.trip.findMany({

            where: {
                fleetManagerId: user?.userId,
                status: tripStatus.ONGOING
            },

            include: {
                driver: {
                    include: {
                        user: true
                    }
                }
            }

        });

        const dashboard = await Promise.all(

            trips.map(async (trip) => {

                const latestVitals = await prisma.vitals.findFirst({

                    where: {
                        tripId: trip.tripId
                    },

                    orderBy: {
                        createdAt: "desc"
                    }

                });
                console.log("Latest vitals:", latestVitals);




                return {

                    tripId: trip.tripId,

                    driverId: trip.driverId,

                    driverName:
                        `${trip.driver?.user.fName} ${trip.driver?.user.lName}`,

                    heartRate: latestVitals?.heartRate ?? null,

                    spo2: latestVitals?.spo2 ?? null,

                    temp: latestVitals?.temp ?? null,

                    createdAt: latestVitals?.createdAt ?? null,
                    id: latestVitals?.id ?? null,




                };

            })

        );

        return res.status(200).json(dashboard);

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            message: "Internal Server Error"

        });

    }

};