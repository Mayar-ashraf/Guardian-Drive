import express from "express"
import { prisma } from "../lib/prisma";
import * as HttpResponses from "../utils/HttpResponses"
import { alertStatus, alertType, Role } from './../../generated/prisma/enums';
import { createHealthEvent } from "./healthEvent.controller";
import { HealthEventError } from "../utils/InternalErrors";

// would want to add driver avg readings too?? <--------------------- 

// to get One driver Alerts , we can get it from here or get it from custom function using /:driverId
export const getAlerts = async (req: express.Request, res: express.Response) => {
    try {
        const { // * filter parameters *
            type,           // alertType: HEALTH_ABNORMAL | SOS | VEHICLE_EMERGENCY
            status,         // alertStatus: ACTIVE | RESOLVED
            driverId,       // Int
            engineId,       // String
            from,           // ISO date string e.g. "2024-01-01"
            to,             // ISO date string e.g. "2024-12-31"
        } = req.query;

        if (driverId && isNaN(parseInt(driverId as string))) {
            return HttpResponses.sendError(res, "Invalid driverId", 400);
        }
        if (from && isNaN(Date.parse(from as string))) {
            return HttpResponses.sendError(res, "Invalid from date", 400);
        }
        if (to && isNaN(Date.parse(to as string))) {
            return HttpResponses.sendError(res, "Invalid to date", 400);
        }

        const driverCondition = req.user?.role === Role.DRIVER
            ? { driverId: req.user?.userId }
            : {};

        const alerts = await prisma.alert.findMany({
            where: {
                // the spread operator either spread values or nothing when the condition is falsy, so each filter is simply skipped if not provided.
                ...(type && { type: type as alertType }),
                ...(status && { status: status as alertStatus }),
                ...(from || to) && {
                    generatedAt: {
                        ...(from && { gte: new Date(from as string) }),
                        ...(to && { lte: new Date(to as string) }),
                    },
                },
                ...((driverId || engineId) && {
                    trip: {
                        ...driverCondition,
                        ...(driverId && { driverId: parseInt(driverId as string) }),
                        ...(engineId && { engineId: engineId as string }),
                    },
                }),
            },
            include: {
                trip: {
                    include: {
                        towingRequest: true,
                        driver: {
                            include: { user: true },
                        },
                    },
                },
                healthEvent: true,
                triggeredLocation: true,
                stoppedLocation: true,
                emergencyServiceRequest: true,
            },
            orderBy: { generatedAt: "desc" },
        });

        const safeAlerts = alerts.map(alert => {
            if (alert.trip.driver?.user) {
                return stripPassword(alert);
            }
            return alert;
        });

        return HttpResponses.sendSuccess(res, safeAlerts)

    } catch (error) {
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message);
        }
        return HttpResponses.sendError(res)
    }
}
export const getAlertById = async (req: express.Request, res: express.Response) => {
    try {
        const alertId = parseInt(req.params.alertId as string);
        if (isNaN(alertId)) {
            return HttpResponses.sendNotFound(res, "Invalid alertId");
        }

        // alert should include (user info - health Event - emergency requestTime , emergency completetionTime, towing request times too)
        const alert = await prisma.alert.findUnique({
            where: { alertId },
            include: {
                trip: {
                    include: {
                        towingRequest: true,
                        driver: {
                            include: {
                                user: true,  // to get driver name, phone etc.
                            },
                        },
                    },
                },
                healthEvents: true,
                triggeredLocation: true,
                stoppedLocation: true,
                emergencyServiceRequest: true,  //  these should be added when implemented Normally <------------------
            },
        });
        if (!alert) {
            return HttpResponses.sendNotFound(res, "Alert Not Found !!")
        }
        if (alert.trip.driverId !== req.user!.userId) {   // driver should only see his alerts
            return HttpResponses.sendForbidden(res);
        }

        // then strip password from returned value
        if (alert && alert.trip.driver?.user) { // the ? because trip may not be assigned a driver 
            // this is not a normal case as alert would be for a driver assigned trip of course but to prevent crashes
            const safeAlert = stripPassword(alert)
            return HttpResponses.sendSuccess(res, safeAlert);
        }

        return HttpResponses.sendSuccess(res, alert);
    } catch (error) {
        if (error instanceof HealthEventError) {
            return HttpResponses.sendError(res, `Health Event Failed: ${error.message}`);
        }
        return HttpResponses.sendError(res)
    }
}
// must get first aid guidance here?? <----------------------
// driver can create sos alerts only <--- how to limit while system also use the same endpoint with the same driverId token
export const createAlert = async (req: express.Request, res: express.Response) => {
    try {
        const driverId = req.user?.userId
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }

        // all are required for database success
        const { type, tripId, locationId, temp, heartRange } = req.body;

        const tripExists = await prisma.trip.findUnique({
            where: { tripId: tripId },
        })
        if (!tripExists) {
            return HttpResponses.sendNotFound(res, "Trip Not found")
        }
        if (!tripExists.driverId || (tripExists.driverId != driverId)) { // if no driver or driver issue the endpoint not the same as driver token
            return HttpResponses.sendForbidden(res, "Not Valid Driver For The Trip !!")
        }


        const locationExist = await prisma.location.findUnique({
            where: { locationId: locationId, }
        })
        if (!locationExist) {
            return HttpResponses.sendNotFound(res, "Location Not Found")
        }
        if (locationExist.tripId != tripId) {
            return HttpResponses.sendForbidden(res, "Not Valid Location For This Trip !!")
        }

        // alert and healthevent creation must be on one transaction - no fails in between
        const result = await prisma.$transaction(async (tx) => {
            const alert = await tx.alert.create({
                data: { type, tripId, triggeredLocationId: locationId, status: alertStatus.ACTIVE },
            });

            const healthEvent = await createHealthEvent(
                heartRange, temp, alert.alertId, driverId, tx)

            return { alert, healthEvent };
        });

        // either both are created successfully or one of them throw an error catched in try block
        return HttpResponses.sendCreated(res, result, "Alert Triggered Successfully")

    } catch (error) {
        if (error instanceof HealthEventError) {
            return HttpResponses.sendError(res, `Health Event Failed: ${error.message}`);
        }
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message)
        }
        return HttpResponses.sendError(res,)
    }
}

// users can update only alert status - stop location - solved at
// note solved at till now must be gotten from frontend - at creation of emergency and towing service request
export const updateAlertById = async (req: express.Request, res: express.Response) => {

    try {
        const alertId = parseInt(req.params.alertId as string);
        if (isNaN(alertId)) {
            return HttpResponses.sendError(res, "Invalid alertId", 400);
        }
        const alert = await prisma.alert.findUnique({
            where: { alertId: alertId },
        });

        if (!alert) {
            return HttpResponses.sendNotFound(res, "Alert Not Found")
        }

        // status MUST be RESOLVED OR NULL/undefined
        const { status, stoppedLocationId } = req.body

        // Validate stoppedLocationId exists if provided
        if (stoppedLocationId !== undefined) {
            const location = await prisma.location.findUnique({
                where: { locationId: stoppedLocationId },
            });
            if (!location) {
                return HttpResponses.sendNotFound(res, "Stopped Location Not Found");
            }
            // Ensure the location belongs to the same trip as the alert
            if (location.tripId !== alert.tripId) {
                return HttpResponses.sendForbidden(res, "Stopped location does not belong to this alert's trip");
            }
        }

        // Prevent re-resolving an already resolved alert - if stoppedLocation is set AFTER resolved status , its okay because then status would be null
        // the only case this happens if fleet Manager re sumbit a solved alert
        if (alert.status === alertStatus.RESOLVED && status === alertStatus.RESOLVED) {
            return HttpResponses.sendError(res, "Alert is already resolved", 409);
        }

        const updatedAlert = await prisma.alert.update({
            where: { alertId },
            data: {
                status: status ?? alert.status,
                solvedAt: status === alertStatus.RESOLVED ? new Date() : alert.solvedAt, // if status = Resolved set time, else it satatus would be null
                stoppedLocationId: stoppedLocationId ?? alert.stoppedLocationId,
            },
        });

        return HttpResponses.sendSuccess(res, updatedAlert);

    } catch (error) {
        return HttpResponses.sendError(res)
    }
}

const stripPassword = (alert: any) => {
    const { password, ...safeUser } = alert.trip.driver.user;
    const safeAlert = {
        ...alert,
        trip: {
            ...alert.trip,
            driver: {
                ...alert.trip.driver,
                user: safeUser,
            },
        },
    };
    return safeAlert
}

/*
// is this really needed?  --- uncomment if needed from alert.route
export const getAlertsByDriverId = async (req: express.Request, res: express.Response) => {
    try {
        const driverId = parseInt(req.params.driverId as string);
        if (isNaN(driverId)) {
            return HttpResponses.sendError(res, "Invalid alertId", 400);
        }
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }
        if (req.user?.userId != driverId) {
            return HttpResponses.sendForbidden(res, "Invalid Driver")
        }
        const alerts = await prisma.alert.findMany({
            where: { trip: { driverId: driverId } },
            include: {
                trip: {
                    include: {
                        towingRequest: true,
                        driver: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                healthEvents: true,
                triggeredLocation: true,
                stoppedLocation: true,
                emergencyServiceRequest: true
            },
        });
        const safeAlerts = alerts.map(alert => {
            if (alert.trip.driver?.user) {
                return stripPassword(alert);
            }
            return alert;
        });

        return HttpResponses.sendSuccess(res, safeAlerts)

    } catch (error) {
        return HttpResponses.sendError(res)
    }
}
    */

