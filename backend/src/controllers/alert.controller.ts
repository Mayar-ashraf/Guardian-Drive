import express from "express"
import { prisma } from "../lib/prisma";
import * as HttpResponses from "../utils/HttpResponses"
import { alertStatus, alertType, Role } from './../../generated/prisma/enums';
import { createHealthEvent, updateHealthEvent } from "./healthEvent.controller";
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
            limit,
            page,
            orderBy,
        } = req.validated?.query;

        const skip = (page - 1) * limit;

        const driverCondition = req.user?.role === Role.DRIVER
            ? { driverId: req.user?.userId }
            : {};

        // date filter — new Date("2024-01-01") defaults to 00:00:00 UTC automatically
        const generatedAtFilter: any = {};
        if (from) generatedAtFilter.gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999); // include the full end day
            generatedAtFilter.lte = toDate;
        }

        const whereConditions: any = {
            ...(type && { type }),
            ...(status && { status }),
            ...(Object.keys(generatedAtFilter).length > 0 && { generatedAt: generatedAtFilter }),
            ...((driverId || engineId || req.user?.role === Role.DRIVER) && {
                trip: {
                    ...driverCondition,
                    ...(driverId && { driverId }),
                    ...(engineId && { engineId }),
                },
            }),
        };
        const [alerts, total] = await prisma.$transaction([
            prisma.alert.findMany({
                where: whereConditions,
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
                orderBy: { generatedAt: orderBy ?? "desc" },
                skip,
                take: limit,
            }),
            prisma.alert.count({ where: whereConditions }),
        ]);

        const safeAlerts = alerts.map(alert => {
            if (alert.trip.driver?.user) {
                return stripPassword(alert);
            }
            return alert;
        });

        console.log(safeAlerts)
        return HttpResponses.sendSuccess(res, {
            ...safeAlerts,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message);
        }
        return HttpResponses.sendError(res)
    }
}
export const getAlertById = async (req: express.Request, res: express.Response) => {
    try {
        const alertId = req.validated?.params?.alertId;
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
                healthEvent: true,
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
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message)
        }
        return HttpResponses.sendError(res,)
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
        const { type, tripId, triggeredLocationId, temp, heartRange, firstAidGuidance } = req.validated?.body;

        const tripExists = await prisma.trip.findUnique({
            where: { tripId: tripId },
        })
        if (!tripExists) {
            return HttpResponses.sendNotFound(res, "Trip Not found")
        }
        if (!tripExists.driverId || (tripExists.driverId != driverId)) { // if no driver or driver issue the endpoint not the same as driver token
            return HttpResponses.sendForbidden(res, "Not Valid Driver For The Trip !!")
        }

        // no two alerts per the same trip
        const existingAlert = await prisma.alert.findFirst({
            where: {
                tripId
            },
        });

        if (existingAlert) {
            return HttpResponses.sendError(res, "Duplicate Alert Per Trip", 409)
        }


        const locationExist = await prisma.location.findUnique({
            where: { locationId: triggeredLocationId, }
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
                data: { type, tripId, triggeredLocationId, status: alertStatus.ACTIVE },
            });

            const healthEvent = await createHealthEvent(
                heartRange, temp, alert.alertId, driverId, firstAidGuidance, tx)

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
        const alertId = req.validated?.params?.alertId;
        const alert = await prisma.alert.findUnique({
            where: { alertId: alertId },
            include: {
                trip: {
                    include: {
                        towingRequest: true,
                    },
                },
                emergencyServiceRequest: true,
            },
        });

        if (!alert) {
            return HttpResponses.sendNotFound(res, "Alert Not Found")
        }

        // 1. ensure resolved alert can't be reassigned to either Resolved or Active
        if (alert.status === alertStatus.RESOLVED) {
            return HttpResponses.sendError(res, "Alert is already resolved", 409); // conflict
        }

        // status MUST be RESOLVED OR NULL/undefined
        const { status, stoppedLocationId, firstAidGuidance } = req.validated?.body

        // Validate stoppedLocationId exists if provided
        // 2. ensure valid stopped Location
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

        // 3. ensure if alert Resolved emergency service request and towing request completion time are filled and stoppedLocation filled
        if (!alert.stoppedLocationId && status === alertStatus.RESOLVED) {
            return HttpResponses.sendBadRequest(res, "Trip hasn't stopped yet")
        }
        if (status === alertStatus.RESOLVED && (!alert.emergencyServiceRequest?.completionTime || !alert.trip.towingRequest?.completionTime)) {
            return HttpResponses.sendBadRequest(res, "Emergency Requests haven't finished yet");
        }


        // all the includes for compatabile return type
        const updatedAlert = await prisma.alert.update({
            where: { alertId },
            data: {
                status: status ?? alert.status,
                solvedAt: status === alertStatus.RESOLVED ? new Date() : alert.solvedAt, // if status = Resolved set time, else it satatus would be null
                stoppedLocationId: stoppedLocationId ?? alert.stoppedLocationId,
            },
            include: {
                trip: {
                    include: {
                        driver: { include: { user: true } },
                        towingRequest: true,
                    },
                },
                healthEvent: true,
                triggeredLocation: true,
                stoppedLocation: true,
                emergencyServiceRequest: true,
            },
        });
        let updatedHealthEvent = updatedAlert.healthEvent;

        if (firstAidGuidance !== undefined) {
            updatedHealthEvent = await updateHealthEvent(alertId, firstAidGuidance);
        }

        // strip password before returning
        if (updatedAlert.trip.driver?.user) {
            const safeUpdatedAlert = stripPassword(updatedAlert)
            return HttpResponses.sendSuccess(res, { ...safeUpdatedAlert, healthEvent: updatedHealthEvent });
        }
        return HttpResponses.sendSuccess(res, { ...updatedAlert, healthEvent: updatedHealthEvent });

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
        const driverId = req.validated?.param.driverId
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
                healthEvent: true,
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

