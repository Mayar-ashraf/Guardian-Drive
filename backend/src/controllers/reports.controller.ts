import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { Trip } from "../../generated/prisma/client"
import { sendError, sendNotFound, sendSuccess } from "../utils/HttpResponses";
import { carStatus, Role, tripStatus , ConditionType,ConditionSeverity } from "../../generated/prisma/enums";
import { id } from "zod/locales";
import { date } from "zod";
import { NOTFOUND } from "node:dns";
import { Stats } from "node:fs";
import { CANCELLED } from "node:dns/promises";


export async function getDriverReport(req: Request, res: Response) {
    try {
        const driverId = req.validated?.params.driverId
        const validatedQuery = req.validated?.query
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
            plannedStartTime: {
                ...(validatedQuery.fromStartDate && {
                    gte: new Date(validatedQuery.fromStartDate)
                }),
                ...(validatedQuery.toStartDate && {
                    lte: new Date(validatedQuery.toStartDate)
                })
            }
        };
        const driver = await prisma.driver.findUniqueOrThrow({
            where: { id: driverId },
            include: {
                user: {
                    select: {
                        fName: true,
                        lName: true
                    }
                }
            }
        });
        const driverName = `${driver.user.fName} ${driver.user.lName}`;
        const tripsForTime = await prisma.trip.findMany({
            where: {
                driverId,
                status: "COMPLETED",
                ...whereConditions
            },
            select: {
                startTime: true,
                endTime: true
            }
        });
        const tripStats = await prisma.trip.groupBy({
            by: ['status'],
            where: {
                driverId,
                ...whereConditions
            },
            _count: {
                _all: true
            }
        });
        let totalTrips = 0;
        let completedTrips = 0;
        let cancelledTrips = 0;
        let plannedTrips = 0;

        for (const stat of tripStats) {
            totalTrips += stat._count._all;

            if (stat.status === "COMPLETED") {
                completedTrips = stat._count._all;
            }
            if (stat.status === "CANCELLED") {
                cancelledTrips = stat._count._all;
            }
            if (stat.status === "PLANNED") {
                plannedTrips = stat._count._all;
            }
        }
        const alertStats = await prisma.alert.groupBy({
            by: ['type'],
            where: {
                trip: {
                    driverId,
                    ...whereConditions
                }
            },
            _count: {
                _all: true
            }
        });
        let totalAlerts = 0;
        let healthAlerts = 0;
        let sosAlerts = 0;

        for (const stat of alertStats) {
            totalAlerts += stat._count._all;

            if (stat.type === "HEALTH_ABNORMAL") {
                healthAlerts = stat._count._all;
            }
            if (stat.type === "SOS") {
                sosAlerts = stat._count._all;
            }
        }
        const totalDrivingHours = totalDrivingTime(tripsForTime)
        return res.status(200).json({
            driverId,
            driverName,
            totalTrips,
            totalDrivingHours,
            completedTrips,
            cancelledTrips,
            plannedTrips,
            totalAlerts,
            healthAlerts,
            sosAlerts
        });

    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(422).json({ message: "Driver doesn't exist" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
type TripTime = {
    startTime: Date | null;
    endTime: Date | null;
};
function totalDrivingTime(trips: TripTime[]) {
    let totalTime = 0
    for (const trip of trips) {
        if (trip.startTime && trip.endTime) {
            const tripTime =
                new Date(trip.endTime).getTime() -
                new Date(trip.startTime).getTime();

            totalTime += tripTime;
        }
    }
    //convert from millisec to hours
    return Number((totalTime / (1000 * 60 * 60)).toFixed(2));;
}

export async function getAlertsByArea(req: Request, res: Response) {
    try {
        const validatedQuery = req.validated?.query
        const whereConditions = {
            generatedAt: {
                ...(validatedQuery.from && {
                    gte: new Date(validatedQuery.from)
                }),
                ...(validatedQuery.to && {
                    lte: new Date(validatedQuery.to)
                })
            }
        };
        const alerts = await prisma.alert.findMany({
            where: whereConditions,
            select: {
                alertId: true,
                stoppedLocation: true,
                generatedAt: true
            }
        })
        return res.status(200).json({ alerts })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });

    }
}

export const emergencyPerformanceReport = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.validated!.query;

        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        const emergencies = await prisma.emergencyServiceRequest.findMany({
            where: {
                requestTime: {
                    gte: from,
                    lte: endDate
                },
            }
        });

        if (emergencies.length === 0) {
            return sendSuccess(res, {
                total_emergency_requests: 0,
                avg_response_time: 0
            })
        }
        let totalResponseTime = 0;
        let resolvedCount = 0;

        let fastestResponseTime = Infinity;
        let slowestResponseTime = -Infinity;


        for (const emg of emergencies) {
            if (emg.status === "COMPLETED" && emg.completionTime) {
                const diff = emg.completionTime!.getTime() - emg.requestTime.getTime();
                const minutes = diff / 60000
                totalResponseTime += minutes;
                resolvedCount++;

                if (minutes < fastestResponseTime) {
                    fastestResponseTime = minutes;
                }
                if (minutes > slowestResponseTime) {
                    slowestResponseTime = minutes;
                }
            }
        }
        const avgResponseTime = resolvedCount > 0 ? (totalResponseTime / resolvedCount) : 0;

        return sendSuccess(res, {
            period: {
                from: from,
                to: endDate
            },
            total_emergency_requests: emergencies.length,
            resolved_emergency_requests: resolvedCount,
            avg_emergency_response_time_minutes: avgResponseTime,
            pending_emergency_requests: emergencies.length - resolvedCount,
            slowestResponseMinutes: resolvedCount > 0 ? slowestResponseTime : 0,
            fastestResponseMinutes: resolvedCount > 0 ? fastestResponseTime : 0
        });
    }
    catch (error) {
        return sendError(res);
    }
}

/* alerts_per_driver_object
{
  "driver_id": integer,
  "driver_name": string,
  "total_alerts": int
}
*/
export const alertsPerDriverReport = async (req: Request, res: Response) => {
    try {
        const driverId = Number(req.validated!.params.driverId);

        const { from, to } = req.validated!.query;

        if (isNaN(driverId)) {
            return res.status(400).json({ message: "Invalid driverId" });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const driver = await prisma.user.findFirst({
            where: {
                id: driverId,
                role: Role.DRIVER
            },
            select: {
                id: true,
                fName: true,
                lName: true
            }
        });

        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        const totalAlerts = await prisma.alert.count({
            where: {
                generatedAt: {
                    gte: fromDate,
                    lte: toDate
                },
                trip: {
                    driverId: driverId
                }
            }
        });

        return res.status(200).json({
            driver_id: driver.id,
            driver_name: `${driver.fName} ${driver.lName}`,
            total_alerts: totalAlerts
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
/*
alerts_per_condition_object
{
  "condition": string,
  "total_alerts": int,
}
*/



export const alertsPerConditionReport = async (
    req: Request,
    res: Response
) => {
    try {
        const { from, to } = req.validated!.query;

        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date format",
            });
        }

        toDate.setHours(23, 59, 59, 999);

        const alerts = await prisma.alert.findMany({
            where: {
                generatedAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            include: {
                healthEvent: {
                    include: {
                        guidances: true,
                    },
                },
            },
        });

        const counts: Record<
            string,
            {
                condition: ConditionType;
                severity: ConditionSeverity;
                totalAlerts: number;
            }
        > = {};

        for (const alert of alerts) {
            if (!alert.healthEvent) continue;

            for (const guidance of alert.healthEvent.guidances) {
                const key = `${guidance.condition}_${guidance.severity}`;

                if (!counts[key]) {
                    counts[key] = {
                        condition: guidance.condition,
                        severity: guidance.severity,
                        totalAlerts: 0,
                    };
                }

                counts[key].totalAlerts++;
            }
        }

        const report = Object.values(counts).sort((a, b) => {
            if (a.condition === b.condition) {
                return a.severity.localeCompare(b.severity);
            }

            return a.condition.localeCompare(b.condition);
        });

        return res.status(200).json({
            period: {
                from,
                to,
            },
            totalConditions: report.length,
            report,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const yearlyAlertsReport = async (req: Request, res: Response) => {
    const { fromYear, toYear } = req.validated!.query;
    const from = new Date(fromYear, 0, 1);
    const to = new Date(toYear + 1, 0, 1); // till the date of start of the year after 'toYear'

    const alerts = await prisma.alert.findMany({
        where: {
            generatedAt: {
                gte: from,
                lte: to
            }
        }
    });

    if (alerts.length === 0) {
        return sendNotFound(res, "No Alerts found in this period.");
    }

    const yearlyMap: Record<number, {
        totalAlerts: number,
        manualSosAlerts: number,
        healthAbnormalAlerts: number
    }> = {};

    for (const alert of alerts) {
        const year = alert.generatedAt.getFullYear();
        yearlyMap[year] ??= { totalAlerts: 0, manualSosAlerts: 0, healthAbnormalAlerts: 0 };
        yearlyMap[year].totalAlerts++;
        switch (alert.type) {
            case "SOS":
                yearlyMap[year].manualSosAlerts++;
                break;

            default:
                yearlyMap[year].healthAbnormalAlerts++;
                break;
        }
    }

    const yearlyStatistics = Object.entries(yearlyMap).map(([year, stats]) => ({
        year: Number(year),
        ...stats
    })).sort((a, b) => a.year - b.year);

    return sendSuccess(res, { totalYears: yearlyStatistics.length, yearlyStatistics });

};

export const fleetManagersTripsReport = async (req: Request, res: Response) => {

    const { from, to } = req.validated!.query;

    const trips = await prisma.trip.findMany({
        where: {
            plannedStartTime: {
                gte: from,
                lte: to
            }
        },
        include: {
            fleetManager: true
        }
    });

    const fleetManagersMap: Record<number,
        {
            fleetManagerName: string,
            trips:
            {
                totalTrips: number,
                plannedTrips: number,
                ongoingTrips: number,
                cancelledTrips: number,
                completedTrips: number
            }
        }> = {};

    for (const trip of trips) {
        const id = trip.fleetManagerId;
        fleetManagersMap[id] ??= {
            fleetManagerName: `${trip.fleetManager.fName} ${trip.fleetManager.lName}`,
            trips: {
                totalTrips: 0,
                plannedTrips: 0,
                ongoingTrips: 0,
                cancelledTrips: 0,
                completedTrips: 0
            }
        };
        fleetManagersMap[id].trips.totalTrips++;
        switch (trip.status) {
            case "PLANNED":
                fleetManagersMap[id].trips.plannedTrips++;
                break;
            case "ONGOING":
                fleetManagersMap[id].trips.ongoingTrips++;
                break;
            case "CANCELLED":
                fleetManagersMap[id].trips.cancelledTrips++;
                break;
            case "COMPLETED":
                fleetManagersMap[id].trips.completedTrips++;
                break;
        }
    };
    const fleetManagerStatistics = Object.entries(fleetManagersMap).map(([id, data]) => ({
        fleetManagerId: id,
        ...data
    })).sort((a, b) => Number(a.fleetManagerId) - Number(b.fleetManagerId));

    return sendSuccess(res, fleetManagerStatistics);
};