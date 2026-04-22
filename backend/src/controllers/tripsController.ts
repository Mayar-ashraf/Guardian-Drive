import { Role, tripStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden, sendNotFound, sendError, sendNoContent, sendCreated, sendSuccess } from "../utils/HTMLresponses";
import { carStatus } from './../../generated/prisma/enums';
import { templateLiteral } from "zod";
import { is, tr } from "zod/locales";
import { error } from "node:console";

async function createTrip(req: Request, res: Response) {
    try {
        /*
          tripId     Int        @id @default(autoincrement())
  startPoint String
  destPoint  String
  startTime  DateTime
  endTime    DateTime?
  status     tripStatus

  location   Location[]
  alerts Alert[]

  towingRequest TowingRequest?
  */
        const { startPoint, destPoint, startTime, location } = req.body
        const user = req.user
        const trip = await prisma.trip.create({
            data: {
                startPoint: startPoint,
                destPoint: destPoint,
                startTime: startTime,
                status: tripStatus.PLANNED,
                location: location
            }
        })

        return res.status(201).json({ message: "Trip created successfully", trip });
    } catch (error) {
        // console.error("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" })
    }

}
async function readTrips(req: Request, res: Response) {

    try {
        const user = req.user
        let trips;

        if (user?.role === "ADMIN" || user?.role === "FLEET_MANAGER") {
            trips = await prisma.trip.findMany()

        } else {
            trips = null;

        }
        return res.status(200).json({ trips })


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




export { createTrip, readTrips, getTripLocation }