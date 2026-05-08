import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { Trip } from "../../generated/prisma/client"
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