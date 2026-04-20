import { Role, tripStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/jwt";
import { sendUnauthorized, sendForbidden, sendNotFound, sendError, sendNoContent, sendCreated, sendSuccess } from "../utils/HTMLresponses";
import { carStatus } from './../../generated/prisma/enums';

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




export { createTrip, readTrips }