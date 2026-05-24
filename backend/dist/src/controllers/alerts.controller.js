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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlertById = exports.createAlert = exports.getAlertById = exports.getAlerts = void 0;
const prisma_1 = require("../lib/prisma");
const HttpResponses = __importStar(require("../utils/HttpResponses"));
const enums_1 = require("../../generated/prisma/enums");
const healthEvent_service_1 = require("../services/healthEvent.service");
const InternalErrors_1 = require("../utils/InternalErrors");
// would want to add driver avg readings too?? <--------------------- 
// to get One driver Alerts , we can get it from here or get it from custom function using /:driverId
const getAlerts = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { // * filter parameters *
        type, // alertType: HEALTH_ABNORMAL | SOS | VEHICLE_EMERGENCY
        status, // alertStatus: ACTIVE | RESOLVED
        driverId, // Int
        engineId, // String
        from, // ISO date string e.g. "2024-01-01"
        to, // ISO date string e.g. "2024-12-31"
        limit, page, orderBy, } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.query;
        const skip = (page - 1) * limit;
        const driverCondition = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === enums_1.Role.DRIVER
            ? { driverId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId }
            : {};
        // date filter — new Date("2024-01-01") defaults to 00:00:00 UTC automatically
        const generatedAtFilter = {};
        if (from)
            generatedAtFilter.gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999); // include the full end day
            generatedAtFilter.lte = toDate;
        }
        const whereConditions = Object.assign(Object.assign(Object.assign(Object.assign({}, (type && { type })), (status && { status })), (Object.keys(generatedAtFilter).length > 0 && { generatedAt: generatedAtFilter })), ((driverId || engineId || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) === enums_1.Role.DRIVER) && {
            trip: Object.assign(Object.assign(Object.assign({}, driverCondition), (driverId && { driverId })), (engineId && { engineId })),
        }));
        const alerts = await prisma_1.prisma.alert.findMany({
            where: whereConditions,
            select: {
                alertId: true,
                /*trip: {
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
                },*/
                /*healthEvent: {
                    select: {
                        eventDate: true,
                        eventId: true,
                        temp: true,
                        spo2: true,
                        heartRate: true,
                    }
                },*/
                status: true,
                // solvedAt: true,
                generatedAt: true,
                type: true,
                // triggeredLocationId: true,
                triggeredLocation: true,
                /*stoppedLocationId: true,
                stoppedLocation: true,*/
            },
            orderBy: { generatedAt: orderBy !== null && orderBy !== void 0 ? orderBy : "desc" },
            skip,
            take: limit,
        });
        const total = await prisma_1.prisma.alert.count({
            where: whereConditions,
        });
        /*
        const safeAlerts = alerts.map(alert => {
            if (alert.trip.driver?.user) {
                return stripPassword(alert);
            }
            return alert;
        });
        */
        console.log(alerts);
        return HttpResponses.sendSuccess(res, {
            alerts: alerts,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message);
        }
        return HttpResponses.sendError(res);
    }
};
exports.getAlerts = getAlerts;
const getAlertById = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const alertId = (_b = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.alertId;
        // alert should include (user info - health Event - emergency requestTime , emergency completetionTime, towing request times too)
        const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
        var alert = null;
        if (userRole != enums_1.Role.DRIVER) {
            alert = await prisma_1.prisma.alert.findUnique({
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
                                    }, // to get driver name, phone etc.
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
            alert = await prisma_1.prisma.alert.findUnique({
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
                    }, /*
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
            return HttpResponses.sendNotFound(res, "Alert Not Found !!");
        }
        if (req.user.role === enums_1.Role.DRIVER && alert.trip.driverId !== req.user.userId) { // driver should only see his alerts
            return HttpResponses.sendForbidden(res);
        }
        console.log(req.user);
        console.log(req.user.role);
        // then strip password from returned value  <--- not needed now
        /*
        if (alert && alert.trip.driver?.user) { // the ? because trip may not be assigned a driver
            // this is not a normal case as alert would be for a driver assigned trip of course but to prevent crashes
            const safeAlert = stripPassword(alert)
            return HttpResponses.sendSuccess(res, safeAlert);
        }
        */
        // map the guidance severity into the driver vitals condition -- done only for driver ?
        if (userRole != enums_1.Role.DRIVER) {
            return HttpResponses.sendSuccess(res, alert);
        }
        // else
        const guidances = (_e = (_d = alert.healthEvent) === null || _d === void 0 ? void 0 : _d.guidances) !== null && _e !== void 0 ? _e : [];
        const result = Object.assign(Object.assign({}, alert), { healthEvent: alert.healthEvent ? {
                heartRate: alert.healthEvent.heartRate,
                temp: alert.healthEvent.temp,
                spo2: alert.healthEvent.spo2,
                heartRateStatus: (_g = (_f = guidances.find(g => g.condition === "HIGH_HEART_RATE")) === null || _f === void 0 ? void 0 : _f.severity) !== null && _g !== void 0 ? _g : "NORMAL",
                tempStatus: (_j = (_h = guidances.find(g => g.condition === "HIGH_TEMP")) === null || _h === void 0 ? void 0 : _h.severity) !== null && _j !== void 0 ? _j : "NORMAL",
                spo2Status: (_l = (_k = guidances.find(g => g.condition === "LOW_SPO2")) === null || _k === void 0 ? void 0 : _k.severity) !== null && _l !== void 0 ? _l : "NORMAL",
            } : null });
        return HttpResponses.sendSuccess(res, result);
    }
    catch (error) {
        if (error instanceof InternalErrors_1.HealthEventError) {
            return HttpResponses.sendError(res, `Health Event Failed: ${error.message}`);
        }
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message);
        }
        return HttpResponses.sendError(res);
    }
};
exports.getAlertById = getAlertById;
// must get first aid guidance here?? <----------------------
// driver can create sos alerts only <--- how to limit while system also use the same endpoint with the same driverId token
const createAlert = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        // its okay like that because validation schema already validates if driver is sending other than SOS alert
        // driverId coming from user token if driver endpoint and from params if system endpoint
        const driverId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : (_c = req.validated) === null || _c === void 0 ? void 0 : _c.params.driverId;
        const driver = await prisma_1.prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }
        // all are required for database success
        const { type, tripId, triggeredLocationId, temp, heartRate, spo2 } = (_d = req.validated) === null || _d === void 0 ? void 0 : _d.body;
        const tripExists = await prisma_1.prisma.trip.findUnique({
            where: { tripId: tripId },
        });
        if (!tripExists) {
            return HttpResponses.sendNotFound(res, "Trip Not found");
        }
        if (!tripExists.driverId || (tripExists.driverId != driverId)) { // if no driver or driver issue the endpoint not the same as driver token
            return HttpResponses.sendForbidden(res, "Not Valid Driver For The Trip !!");
        }
        if (tripExists.status !== enums_1.tripStatus.ONGOING) {
            return HttpResponses.sendBadRequest(res, "trip must be ONGOING");
        }
        // no two alerts per the same trip
        const existingAlert = await prisma_1.prisma.alert.findFirst({
            where: {
                tripId
            },
        });
        if (existingAlert) {
            return HttpResponses.sendConflict(res, "Duplicate Alert Per Trip");
        }
        const locationExist = await prisma_1.prisma.location.findUnique({
            where: { locationId: triggeredLocationId, }
        });
        if (!locationExist) {
            return HttpResponses.sendNotFound(res, "Location Not Found");
        }
        if (locationExist.tripId != tripId) {
            return HttpResponses.sendForbidden(res, "Not Valid Location For This Trip !!");
        }
        // alert and healthevent creation must be on one transaction - no fails in between
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const alert = await tx.alert.create({
                data: { type, tripId, triggeredLocationId, status: enums_1.alertStatus.ACTIVE },
            });
            // healthEvent with guidance response if guidance is available or null if no guidance (there is guidance fallback so that supposed to not happen)
            const healthEvent = await (0, healthEvent_service_1.createHealthEvent)(heartRate, temp, spo2, alert.alertId, driverId, tx);
            // trip is updated to cancelled at creating alert
            const trip = await tx.trip.update({
                where: { tripId },
                data: {
                    status: enums_1.tripStatus.CANCELLED,
                    endTime: new Date()
                }
            });
            return { alert, healthEvent, trip };
        });
        // either both are created successfully or one of them throw an error catched in try block
        return HttpResponses.sendCreated(res, result, "Alert Triggered Successfully");
    }
    catch (error) {
        if (error instanceof InternalErrors_1.HealthEventError) {
            return HttpResponses.sendError(res, `Health Event Failed: ${error.message}`);
        }
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message);
        }
        return HttpResponses.sendError(res);
    }
};
exports.createAlert = createAlert;
// users can update only alert status - stop location - solved at
// note solved at till now must be gotten from frontend - at creation of emergency and towing service request
const updateAlertById = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        const alertId = (_b = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.alertId;
        const alert = await prisma_1.prisma.alert.findUnique({
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
            return HttpResponses.sendNotFound(res, "Alert Not Found");
        }
        // 1. ensure resolved alert can't be reassigned to either Resolved or Active
        if (alert.status === enums_1.alertStatus.RESOLVED) {
            return HttpResponses.sendConflict(res, "Alert is already resolved");
        }
        // status MUST be RESOLVED OR NULL/undefined
        const { status, stoppedLocationId } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.body;
        // Validate stoppedLocationId exists if provided
        // 2. ensure valid stopped Location
        const location = await prisma_1.prisma.location.findUnique({
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
        if (!alert.stoppedLocationId && status === enums_1.alertStatus.RESOLVED) {
            return HttpResponses.sendBadRequest(res, "Trip hasn't stopped yet");
        }
        if (status === enums_1.alertStatus.RESOLVED && (!((_d = alert.emergencyServiceRequest) === null || _d === void 0 ? void 0 : _d.completionTime) || !((_e = alert.trip.towingRequest) === null || _e === void 0 ? void 0 : _e.completionTime))) {
            return HttpResponses.sendBadRequest(res, "Emergency Requests haven't finished yet");
        }
        // all the includes for compatabile return type
        const updatedAlert = await prisma_1.prisma.alert.update({
            where: { alertId },
            data: {
                status: status !== null && status !== void 0 ? status : alert.status,
                solvedAt: status === enums_1.alertStatus.RESOLVED ? new Date() : alert.solvedAt, // if status = Resolved set time, else it satatus would be null
                stoppedLocationId: stoppedLocationId !== null && stoppedLocationId !== void 0 ? stoppedLocationId : alert.stoppedLocationId,
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
        // strip password before returning
        if ((_f = updatedAlert.trip.driver) === null || _f === void 0 ? void 0 : _f.user) {
            const safeUpdatedAlert = stripPassword(updatedAlert);
            return HttpResponses.sendSuccess(res, Object.assign(Object.assign({}, safeUpdatedAlert), { healthEvent: updatedHealthEvent }));
        }
        return HttpResponses.sendSuccess(res, Object.assign(Object.assign({}, updatedAlert), { healthEvent: updatedHealthEvent }));
    }
    catch (error) {
        return HttpResponses.sendError(res);
    }
};
exports.updateAlertById = updateAlertById;
const stripPassword = (alert) => {
    const _a = alert.trip.driver.user, { password } = _a, safeUser = __rest(_a, ["password"]);
    const safeAlert = Object.assign(Object.assign({}, alert), { trip: Object.assign(Object.assign({}, alert.trip), { driver: Object.assign(Object.assign({}, alert.trip.driver), { user: safeUser }) }) });
    return safeAlert;
};
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
