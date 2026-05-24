"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverAvgReadings = exports.createDriverAvgReadings = void 0;
const prisma_1 = require("../lib/prisma");
const HttpResponses = __importStar(require("../utils/HttpResponses"));
const enums_1 = require("../../generated/prisma/enums");
const NUMBER_OF_AVG_ROWS = 10;
// creates avgReading/trip AND update medical info thresholds
const createDriverAvgReadings = async (req, res) => {
    var _a, _b, _c;
    try {
        const driverId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.query.driverId;
        const tripId = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.body.tripId;
        const { avgHeartRate, avgTemp, avgSpo2 } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.body;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { tripId }
        });
        if (!trip) {
            return HttpResponses.sendNotFound(res, "Trip not Found");
        }
        // create avg readings only for finished trips
        if (trip.status !== enums_1.tripStatus.COMPLETED && trip.status !== enums_1.tripStatus.CANCELLED) {
            return HttpResponses.sendBadRequest(res, "Vitals can only be submitted for finished trips");
        }
        if (!trip.driverId || driverId != trip.driverId) {
            return HttpResponses.sendBadRequest(res, "Driver Not valid for this trip");
        }
        const existingReadings = await prisma_1.prisma.avgHealthReadings.findUnique({
            where: { tripId },
        });
        if (existingReadings) {
            return HttpResponses.sendConflict(res, "Avg readings already submitted for this trip");
        }
        const medicalInfoRecord = await prisma_1.prisma.medicalInformation.findUnique({
            where: { driverId: driverId }
        });
        if (!medicalInfoRecord) {
            return HttpResponses.sendNotFound(res, "No medical Info Saved for this driver");
        }
        const createdAvgReadings = await prisma_1.prisma.avgHealthReadings.create({
            data: {
                avgHeartRate,
                avgSpo2,
                avgTemp,
                driverId,
                tripId,
            },
        });
        // findMany last NUMBER_OF_AVG_ROWS then compute manually averages
        const lastRows = await prisma_1.prisma.avgHealthReadings.findMany({
            where: {
                driverId: driverId,
                trip: { status: enums_1.tripStatus.COMPLETED }
            },
            orderBy: { trip: { startTime: "desc" } },
            take: NUMBER_OF_AVG_ROWS,
            select: {
                avgHeartRate: true,
                avgSpo2: true,
                avgTemp: true,
            },
        });
        if (lastRows.length === NUMBER_OF_AVG_ROWS) {
            // helper avg arrow function
            const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
            const heartRates = lastRows.map(r => r.avgHeartRate);
            const spo2s = lastRows.map(r => r.avgSpo2);
            const temps = lastRows.map(r => r.avgTemp);
            const minHeartRate = Math.min(...heartRates);
            const maxHeartRate = Math.max(...heartRates);
            const newAvgHeartRate = avg(heartRates);
            const minSpo2 = Math.min(...spo2s);
            const maxSpo2 = Math.max(...spo2s);
            const newAvgSpo2 = avg(spo2s);
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            const newAvgTemp = avg(temps);
            const updatedMedicalRecord = await prisma_1.prisma.medicalInformation.update({
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
            return HttpResponses.sendSuccess(res, { createdAvgReadings, updatedMedicalRecord });
        }
        return HttpResponses.sendSuccess(res, createdAvgReadings);
    }
    catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message);
        return HttpResponses.sendError(res);
    }
};
exports.createDriverAvgReadings = createDriverAvgReadings;
// GET /drivers/:driverId/avg-readings
const getDriverAvgReadings = async (req, res) => {
    var _a;
    try {
        const driverId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.driverId;
        const driver = await prisma_1.prisma.driver.findUnique({
            where: { id: driverId }
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver Not Found");
        }
        const avgReadingsTrips = await prisma_1.prisma.avgHealthReadings.findMany({
            where: { driverId },
            orderBy: { trip: { startTime: "desc" } },
            include: {
                trip: true
            }
        });
        return HttpResponses.sendSuccess(res, avgReadingsTrips);
    }
    catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message);
        return HttpResponses.sendError(res);
    }
};
exports.getDriverAvgReadings = getDriverAvgReadings;
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
