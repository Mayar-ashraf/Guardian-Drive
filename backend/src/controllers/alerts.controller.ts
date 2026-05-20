import express from "express"
import { prisma } from "../lib/prisma";
import * as HttpResponses from "../utils/HttpResponses"
import { alertStatus, alertType, Role, tripStatus } from '../../generated/prisma/enums';
import { createHealthEvent } from "../services/healthEvent.service";
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
        const alerts = await prisma.alert.findMany({
            where: whereConditions,
            select: {
                alertId: true,
                trip: {
                    select: {
                        driver: {
                            select: {
                                user: {
                                    select: {
                                        email: true,
                                        fName: true,
                                        lName: true,
                                        phone: true
                                    }
                                },
                            }
                        },
                    },
                },
                healthEvent: {
                    select: {
                        eventDate: true,
                        eventId: true,
                        temp: true,
                        spo2: true,
                        heartRate: true,
                    }
                },
                status: true,
                solvedAt: true,
                generatedAt: true,
                type: true,
                triggeredLocationId: true,
                stoppedLocationId: true,
            },
            orderBy: { generatedAt: orderBy ?? "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.alert.count({
            where: whereConditions,
        });
        const safeAlerts = alerts.map(alert => {
            if (alert.trip.driver?.user) {
                return stripPassword(alert);
            }
            return alert;
        });

        console.log(safeAlerts)
        return HttpResponses.sendSuccess(res, {
            alerts: safeAlerts,
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
        const userRole = req.user?.role;
        var alert = null;
        if (userRole != Role.DRIVER) {
            alert = await prisma.alert.findUnique({
                where: { alertId },
                include: {
                    trip: {
                        include: {
                            towingRequest: true,
                            driver: {
                                select: {
                                    id: true,
                                    drivingLicense: true,
                                    user: {
                                        select: {
                                            email: true,
                                            fName: true,
                                            lName: true,
                                            phone: true,
                                            address: true,
                                            hiredAt: true,
                                        }
                                    },  // to get driver name, phone etc.
                                },
                            },
                            car: true
                        },
                    },
                    healthEvent: {
                        include: {
                            guidances: true
                        }
                    },
                    triggeredLocation: true,
                    stoppedLocation: true,
                    emergencyServiceRequest: true,
                },
            });
        }
        else {
            alert = await prisma.alert.findUnique({
                where: { alertId },
                select: {
                    alertId: true,
                    type: true,
                    status: true,
                    generatedAt: true,
                    solvedAt: true,
                    triggeredLocationId: true,
                    triggeredLocation: {
                        select: {
                            locationId: true,
                            time: true,
                            latitude: true,
                            longitude: true,
                        }
                    },
                    trip: {
                        select: {
                            car: {
                                select: {
                                    engineId: true,
                                    plateNo: true,
                                    color: true,
                                    status: true,
                                }
                            },
                            driverId: true,
                        }
                    },
                    healthEvent: {
                        select: {
                            heartRate: true,
                            temp: true,
                            spo2: true,
                            guidances: true,
                        }
                    },
                    emergencyServiceRequest: {
                        select: {
                            completionTime: true,
                        }
                    },/*
                    stoppedLocationId: true,
                    stoppedLocation: {
                        select: {
                            locationId: true,
                            time: true,
                            latitude: true,
                            longitude: true,
                        }
                    },*/
                },
            });
        }
        if (!alert) {
            return HttpResponses.sendNotFound(res, "Alert Not Found !!")
        }
        if (req.user!.role === Role.DRIVER && alert.trip.driverId !== req.user!.userId) {   // driver should only see his alerts
            return HttpResponses.sendForbidden(res);
        }
        console.log(req.user);
        console.log(req.user!.role);
        // then strip password from returned value  <--- not needed now
        /*
        if (alert && alert.trip.driver?.user) { // the ? because trip may not be assigned a driver 
            // this is not a normal case as alert would be for a driver assigned trip of course but to prevent crashes
            const safeAlert = stripPassword(alert)
            return HttpResponses.sendSuccess(res, safeAlert);
        }
        */

        // map the guidance severity into the driver vitals condition -- done only for driver ?

        if (userRole != Role.DRIVER) {
            return HttpResponses.sendSuccess(res, alert);
        }
        // else
        const guidances = alert.healthEvent?.guidances ?? [];
        const result = {
            ...alert,
            healthEvent: alert.healthEvent ? {
                heartRate: alert.healthEvent.heartRate,
                temp: alert.healthEvent.temp,
                spo2: alert.healthEvent.spo2,
                heartRateStatus: guidances.find(g => g.condition === "HIGH_HEART_RATE")?.severity ?? "NORMAL",
                tempStatus: guidances.find(g => g.condition === "HIGH_TEMP")?.severity ?? "NORMAL",
                spo2Status: guidances.find(g => g.condition === "LOW_SPO2")?.severity ?? "NORMAL",
            } : null,
        };

        return HttpResponses.sendSuccess(res, result);

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
        // its okay like that because validation schema already validates if driver is sending other than SOS alert
        // driverId coming from user token if driver endpoint and from params if system endpoint
        const driverId = req.user?.userId ?? req.validated?.params.driverId;

        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }

        // all are required for database success
        const { type, tripId, triggeredLocationId, temp, heartRate, spo2 } = req.validated?.body;

        const tripExists = await prisma.trip.findUnique({
            where: { tripId: tripId },
        })
        if (!tripExists) {
            return HttpResponses.sendNotFound(res, "Trip Not found")
        }
        if (!tripExists.driverId || (tripExists.driverId != driverId)) { // if no driver or driver issue the endpoint not the same as driver token
            return HttpResponses.sendForbidden(res, "Not Valid Driver For The Trip !!")
        }

        if (tripExists.status !== tripStatus.ONGOING) {
            return HttpResponses.sendBadRequest(res, "trip must be ONGOING")
        }

        // no two alerts per the same trip
        const existingAlert = await prisma.alert.findFirst({
            where: {
                tripId
            },
        });

        if (existingAlert) {
            return HttpResponses.sendConflict(res, "Duplicate Alert Per Trip")
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

            // healthEvent with guidance response if guidance is available or null if no guidance (there is guidance fallback so that supposed to not happen)
            const healthEvent = await createHealthEvent(
                heartRate, temp, spo2, alert.alertId, driverId, tx)

            // trip is updated to cancelled at creating alert
            const trip = await tx.trip.update({
                where: { tripId },
                data: {
                    status: tripStatus.CANCELLED,
                    endTime: new Date()
                }

            });
            return { alert, healthEvent, trip };
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
        return HttpResponses.sendError(res)
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
            return HttpResponses.sendConflict(res, "Alert is already resolved");
        }

        // status MUST be RESOLVED OR NULL/undefined
        const { status, stoppedLocationId } = req.validated?.body

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
        let updatedHealthEvent = updatedAlert.healthEvent

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
export const getFirstAid = async (req: express.Request, res: express.Response) => {
    try {
        const alertId = req.validated?.params.alertId;
        const user = req.user;
        const alert = await prisma.alert.findUnique({
            where: {
                alertId
            },
            include: {
                trip: true,
                healthEvent: true,
            },
        });
        if (!alert) {
            return HttpResponses.sendNotFound(res, "Alert with this alert Id doesn't exist");

        }

        if (!alert.healthEvent) {
            return HttpResponses.sendNotFound(res, "No Health event found for this alert");
        }

        const isADMIN = (user?.role === "ADMIN");
        const isAuthorizedFleetManager = (user?.role === "FLEET_MANAGER" && alert?.trip.fleetManagerId === user.userId);
        const isAuthorizedDriver = (user?.role === "DRIVER" && alert?.trip.driverId === user.userId);

        if (!isADMIN && !isAuthorizedFleetManager && !isAuthorizedDriver) {
            return HttpResponses.sendForbidden(res, "You are unauthorized to make this request");
        }
        res.json({ First_Aid_Guidance: alert.healthEvent.firstAidGuidance });

    } catch (error) {
        HttpResponses.sendError(res);
    }
};

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

