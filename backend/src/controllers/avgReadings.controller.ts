import express from "express"
import { prisma } from "../lib/prisma";
import * as HttpResponses from "../utils/HttpResponses"
import { tripStatus } from "../../generated/prisma/enums";


// creates avgReading/trip AND update medical info thresholds
export const createDriverAvgReadings = async (req: express.Request, res: express.Response) => {
    try {
        const driverId = req.validated?.query.driverId
        const tripId = req.validated?.body.tripId
        const { avgHeartRate, avgTemp, avgSpo2 } = req.validated?.body

        const trip = await prisma.trip.findUnique({
            where: { tripId }
        });

        if (!trip) {
            return HttpResponses.sendNotFound(res, "Trip not Found")
        }/*
        if (trip.status !== tripStatus.COMPLETED) {
            return HttpResponses.sendBadRequest(res, "Vitals can only be submitted for completed trips");
        }*/
        if (!trip.driverId || driverId != trip.driverId) {
            return HttpResponses.sendBadRequest(res, "Driver Not valid for this trip");
        }

        const existingReadings = await prisma.avgHealthReadings.findUnique({
            where: { tripId },
        });

        if (existingReadings) {
            return HttpResponses.sendConflict(res, "Avg readings already submitted for this trip");
        }

        const medicalInfoRecord = await prisma.medicalInformation.findUnique({
            where: { driverId: driverId }
        });

        if (!medicalInfoRecord) {
            return HttpResponses.sendNotFound(res, "No medical Info Saved for this driver")
        }

        const createdAvgReadings = await prisma.avgHealthReadings.create({
            data: {
                avgHeartRate,
                avgSpo2,
                avgTemp,
                driverId,
                tripId,
            },
        });

        // findMany last 10 then compute manually averages
        const last10Rows = await prisma.avgHealthReadings.findMany({
            where: { driverId: driverId },
            orderBy: { trip: { startTime: "desc" } },
            take: 10,
            select: {
                avgHeartRate: true,
                avgSpo2: true,
                avgTemp: true,
            },
        });

        // helper avg arrow function
        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

        const heartRates = last10Rows.map(r => r.avgHeartRate);
        const spo2s = last10Rows.map(r => r.avgSpo2);
        const temps = last10Rows.map(r => r.avgTemp);

        const minHeartRate = Math.min(...heartRates);
        const maxHeartRate = Math.max(...heartRates);
        const newAvgHeartRate = avg(heartRates);

        const minSpo2 = Math.min(...spo2s);
        const maxSpo2 = Math.max(...spo2s);
        const newAvgSpo2 = avg(spo2s);

        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const newAvgTemp = avg(temps);



        const updatedMedicalRecord = await prisma.medicalInformation.update({
            where: { driverId: driverId },
            data: {
                maxHeartRate,
                minHeartRate,
                avgHeartRate: newAvgHeartRate,

                maxTemp,
                minTemp,
                avgTemp: newAvgTemp,

                maxSpo2,
                minSpo2,
                avgSpo2: newAvgSpo2,
            },
        });

        return HttpResponses.sendSuccess(res, { createdAvgReadings, updatedMedicalRecord })

    }
    catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message)
        return HttpResponses.sendError(res)
    }
}

// GET /drivers/:driverId/avg-readings
export const getDriverAvgReadings = async (req: express.Request, res: express.Response) => {

    try {
        const driverId = req.validated?.params.driverId

        const driver = await prisma.driver.findUnique({
            where: { id: driverId }
        })

        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver Not Found")
        }

        const avgReadingsTrips = await prisma.avgHealthReadings.findMany({
            where: { driverId },
            orderBy: { trip: { startTime: "desc" } },
            include: {
                trip: true
            }
        });

        // strict it to fleetManagers of this trip only or not ?<--------------------

        return HttpResponses.sendSuccess(res, avgReadingsTrips)


    } catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message)
        return HttpResponses.sendError(res)
    }



}
/*
// GET /drivers/:driverId/avg-readings
// Auth: ADMIN, FLEET_MANAGER — any driver | DRIVER — own only
export const getDriverAvgReadings = async (req: Request, res: Response): Promise<void> => {
    const driverId = parseInt(req.params.driverId);

    if (isNaN(driverId)) {
        sendError(res, "Invalid driver ID", 400);
        return;
    }

    // ownership check for drivers
    if (req.user!.role === "DRIVER" && req.user!.userId !== driverId) {
        sendForbidden(res);
        return;
    }

    // verify driver exists
    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        select: {
            id: true, medicalInformation: {
                select: { heartRateRange: true, spo2Range: true, tempRange: true }
            }
        },
    });

    if (!driver) {
        sendNotFound(res, "Driver not found");
        return;
    }

    // get last 10 trip averages
    const last10 = await prisma.avgHealthReadings.findMany({
        where: { driverId },
        orderBy: { recordedAt: "desc" },
        take: 10,
        select: {
            avgHeartRate: true,
            avgSpo2: true,
            avgTemp: true,
            recordedAt: true,
            tripId: true,
        },
    });

    // no trip history yet — return medical info baseline as fallback
    if (last10.length === 0) {
        sendSuccess(res, {
            hasHistory: false,
            heartRateRange: driver.medicalInformation?.heartRateRange ?? null,
            spo2Range: driver.medicalInformation?.spo2Range ?? null,
            tempRange: driver.medicalInformation?.tempRange ?? null,
        });
        return;
    }

    // compute overall avg from last 10
    const avg = (arr: number[]) => parseFloat(
        (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
    );

    sendSuccess(res, {
        hasHistory: true,
        basedOnTrips: last10.length,
        avgHeartRate: avg(last10.map(r => r.avgHeartRate)),
        avgSpo2: avg(last10.map(r => r.avgSpo2)),
        avgTemp: avg(last10.map(r => r.avgTemp)),
        history: last10,  // individual trip rows for the mobile to use if needed
    });
};
*/