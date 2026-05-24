"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fleetManagersTripsReport = exports.yearlyAlertsReport = exports.alertsPerConditionReport = exports.alertsPerDriverReport = exports.emergencyPerformanceReport = void 0;
exports.getDriverReport = getDriverReport;
exports.getAlertsByArea = getAlertsByArea;
const prisma_1 = require("../lib/prisma");
const HttpResponses_1 = require("../utils/HttpResponses");
const enums_1 = require("../../generated/prisma/enums");
async function getDriverReport(req, res) {
    var _a, _b;
    try {
        const driverId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.driverId;
        const validatedQuery = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.query;
        if (validatedQuery.fromStartDate &&
            validatedQuery.toStartDate &&
            new Date(validatedQuery.fromStartDate) > new Date(validatedQuery.toStartDate)) {
            return res.status(400).json({
                message: "fromStartDate cannot be after toStartDate"
            });
        }
        const whereConditions = {
            plannedStartTime: Object.assign(Object.assign({}, (validatedQuery.fromStartDate && {
                gte: new Date(validatedQuery.fromStartDate)
            })), (validatedQuery.toStartDate && {
                lte: new Date(validatedQuery.toStartDate)
            }))
        };
        const driver = await prisma_1.prisma.driver.findUniqueOrThrow({
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
        const tripsForTime = await prisma_1.prisma.trip.findMany({
            where: Object.assign({ driverId, status: "COMPLETED" }, whereConditions),
            select: {
                startTime: true,
                endTime: true
            }
        });
        const tripStats = await prisma_1.prisma.trip.groupBy({
            by: ['status'],
            where: Object.assign({ driverId }, whereConditions),
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
        const alertStats = await prisma_1.prisma.alert.groupBy({
            by: ['type'],
            where: {
                trip: Object.assign({ driverId }, whereConditions)
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
        const totalDrivingHours = totalDrivingTime(tripsForTime);
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
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(422).json({ message: "Driver doesn't exist" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
function totalDrivingTime(trips) {
    let totalTime = 0;
    for (const trip of trips) {
        if (trip.startTime && trip.endTime) {
            const tripTime = new Date(trip.endTime).getTime() -
                new Date(trip.startTime).getTime();
            totalTime += tripTime;
        }
    }
    //convert from millisec to hours
    return Number((totalTime / (1000 * 60 * 60)).toFixed(2));
    ;
}
async function getAlertsByArea(req, res) {
    var _a;
    try {
        const validatedQuery = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.query;
        const whereConditions = {
            generatedAt: Object.assign(Object.assign({}, (validatedQuery.from && {
                gte: new Date(validatedQuery.from)
            })), (validatedQuery.to && {
                lte: new Date(validatedQuery.to)
            }))
        };
        const alerts = await prisma_1.prisma.alert.findMany({
            where: whereConditions,
            select: {
                alertId: true,
                stoppedLocation: true,
                generatedAt: true
            }
        });
        return res.status(200).json({ alerts });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
const emergencyPerformanceReport = async (req, res) => {
    try {
        const { from, to } = req.validated.query;
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        const emergencies = await prisma_1.prisma.emergencyServiceRequest.findMany({
            where: {
                requestTime: {
                    gte: from,
                    lte: endDate
                },
            }
        });
        if (emergencies.length === 0) {
            return (0, HttpResponses_1.sendSuccess)(res, {
                total_emergency_requests: 0,
                avg_response_time: 0
            });
        }
        let totalResponseTime = 0;
        let resolvedCount = 0;
        let fastestResponseTime = Infinity;
        let slowestResponseTime = -Infinity;
        for (const emg of emergencies) {
            if (emg.status === "COMPLETED" && emg.completionTime) {
                const diff = emg.completionTime.getTime() - emg.requestTime.getTime();
                const minutes = diff / 60000;
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
        return (0, HttpResponses_1.sendSuccess)(res, {
            period: {
                from: from,
                to: endDate
            },
            total_emergency_requests: emergencies.length,
            resolved_emergency_requests: resolvedCount,
            avg_emergency_response_time_minutes: avgResponseTime,
            pending_emergency_requests: emergencies.length - resolvedCount,
            slowestResponseMinutes: resolvedCount > 0 ? fastestResponseTime : 0,
            fastestResponseMinutes: resolvedCount > 0 ? slowestResponseTime : 0
        });
    }
    catch (error) {
        return (0, HttpResponses_1.sendError)(res);
    }
};
exports.emergencyPerformanceReport = emergencyPerformanceReport;
/* alerts_per_driver_object
{
  "driver_id": integer,
  "driver_name": string,
  "total_alerts": int
}
*/
const alertsPerDriverReport = async (req, res) => {
    try {
        const driverId = Number(req.validated.params.driverId);
        const { from, to } = req.validated.query;
        if (isNaN(driverId)) {
            return res.status(400).json({ message: "Invalid driverId" });
        }
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        const driver = await prisma_1.prisma.user.findFirst({
            where: {
                id: driverId,
                role: enums_1.Role.DRIVER
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
        const totalAlerts = await prisma_1.prisma.alert.count({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.alertsPerDriverReport = alertsPerDriverReport;
/*
alerts_per_condition_object
{
  "condition": string,
  "total_alerts": int,
}
*/
const alertsPerConditionReport = async (req, res) => {
    try {
        const { from, to } = req.validated.query;
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        const alerts = await prisma_1.prisma.alert.findMany({
            where: {
                generatedAt: {
                    gte: fromDate,
                    lte: toDate
                }
            },
            include: {
                healthEvent: true
            }
        });
        const counts = {};
        for (const alert of alerts) {
            if (!alert.healthEvent)
                continue;
            const heartRate = alert.healthEvent.heartRate;
            const temp = alert.healthEvent.temp;
            let condition = "normal";
            if (heartRate > 100) {
                condition = "high_heart_rate";
            }
            else if (heartRate < 60) {
                condition = "low_heart_rate";
            }
            else if (temp > 38) {
                condition = "fever";
            }
            counts[condition] = (counts[condition] || 0) + 1;
        }
        const result = Object.entries(counts).map(([condition, total]) => ({
            condition,
            total_alerts: total
        }));
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.alertsPerConditionReport = alertsPerConditionReport;
const yearlyAlertsReport = async (req, res) => {
    var _a;
    const { fromYear, toYear } = req.validated.query;
    const from = new Date(fromYear, 0, 1);
    const to = new Date(toYear + 1, 0, 1); // till the date of start of the year after 'toYear'
    const alerts = await prisma_1.prisma.alert.findMany({
        where: {
            generatedAt: {
                gte: from,
                lte: to
            }
        }
    });
    if (alerts.length === 0) {
        return (0, HttpResponses_1.sendNotFound)(res, "No Alerts found in this period.");
    }
    const yearlyMap = {};
    for (const alert of alerts) {
        const year = alert.generatedAt.getFullYear();
        (_a = yearlyMap[year]) !== null && _a !== void 0 ? _a : (yearlyMap[year] = { totalAlerts: 0, manualSosAlerts: 0, healthAbnormalAlerts: 0 });
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
    const yearlyStatistics = Object.entries(yearlyMap).map(([year, stats]) => (Object.assign({ year: Number(year) }, stats))).sort((a, b) => a.year - b.year);
    return (0, HttpResponses_1.sendSuccess)(res, { totalYears: yearlyStatistics.length, yearlyStatistics });
};
exports.yearlyAlertsReport = yearlyAlertsReport;
const fleetManagersTripsReport = async (req, res) => {
    var _a;
    const { from, to } = req.validated.query;
    const trips = await prisma_1.prisma.trip.findMany({
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
    const fleetManagersMap = {};
    for (const trip of trips) {
        const id = trip.fleetManagerId;
        (_a = fleetManagersMap[id]) !== null && _a !== void 0 ? _a : (fleetManagersMap[id] = {
            fleetManagerName: `${trip.fleetManager.fName} ${trip.fleetManager.lName}`,
            trips: {
                totalTrips: 0,
                plannedTrips: 0,
                ongoingTrips: 0,
                cancelledTrips: 0,
                completedTrips: 0
            }
        });
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
    }
    ;
    const fleetManagerStatistics = Object.entries(fleetManagersMap).map(([id, data]) => (Object.assign({ fleetManagerId: id }, data))).sort((a, b) => Number(a.fleetManagerId) - Number(b.fleetManagerId));
    return (0, HttpResponses_1.sendSuccess)(res, fleetManagerStatistics);
};
exports.fleetManagersTripsReport = fleetManagersTripsReport;
