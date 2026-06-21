import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { sendError, sendSuccess } from "../utils/HttpResponses";
import { carStatus, Role, } from "../../generated/prisma/enums";

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [
            totalDrivers,
            driversWithActiveBand,
            carStats,
            totalFleetManagers,
            bandStats
        ] = await Promise.all([
            prisma.driver.count(),

            prisma.wearableBand.count({
                where: { isConnected: true, driverId: { not: null } }
            }),

            prisma.car.groupBy({
                by: ['status'],
                _count: { _all: true }
            }),

            prisma.user.count({
                where: { role: Role.FLEET_MANAGER }
            }),

            prisma.wearableBand.groupBy({
                by: ['isConnected'],
                _count: { _all: true }
            })

            // TODO : can add one more for hardware add-on counts for example
        ])

        let totalCars = 0, carsActive = 0, carsInTrip = 0, carsDisabled = 0
        for (const stat of carStats) {
            totalCars += stat._count._all
            if (stat.status === carStatus.ACTIVE) carsActive = stat._count._all
            if (stat.status === carStatus.IN_TRIP) carsInTrip = stat._count._all
            if (stat.status === carStatus.DISABLED) carsDisabled = stat._count._all
        }

        let totalBands = 0, connectedBands = 0, disconnectedBands = 0
        for (const stat of bandStats) {
            totalBands += stat._count._all
            if (stat.isConnected) connectedBands = stat._count._all
            else disconnectedBands = stat._count._all
        }
        const data = {
            drivers: {
                total: totalDrivers,
                withActiveBand: driversWithActiveBand
            },
            cars: {
                total: totalCars,
                active: carsActive,
                inTrip: carsInTrip,
                disabled: carsDisabled
            },
            fleetManagers: {
                total: totalFleetManagers
            },
            bands: {
                total: totalBands,
                connected: connectedBands,
                disconnected: disconnectedBands
            }
        }
        return sendSuccess(res, data)

    } catch (error) {
        return sendError(res)
    }
}