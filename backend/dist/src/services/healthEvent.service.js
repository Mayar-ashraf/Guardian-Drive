"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthEvent = exports.getHealthEventByAlertId = void 0;
const prisma_1 = require("../lib/prisma");
const InternalErrors_1 = require("../utils/InternalErrors");
const firstAidGuidance_controller_1 = require("../controllers/firstAidGuidance.controller");
const classifyReadings_service_1 = require("./classifyReadings.service");
// can return HealthEvent type or null
const getHealthEventByAlertId = async (alertId) => {
    try {
        const healthEvent = await prisma_1.prisma.healthEvent.findUnique({
            where: { alertId: alertId }
        });
        return healthEvent;
    }
    catch (error) {
        throw new InternalErrors_1.HealthEventError("Server Failed");
    }
};
exports.getHealthEventByAlertId = getHealthEventByAlertId;
// only system can do it (is only called from CreateAlert() ), no route to this function -> therefore no Http Req and Res
// note this is now always created as transaction - created with alert atomically
const createHealthEvent = async (heartRate, temp, spo2, alertId, driverId, tx) => {
    const client = tx !== null && tx !== void 0 ? tx : prisma_1.prisma; // use transaction if provided, otherwise use prisma
    try {
        // 1- check valid records
        // driverId and AlertId already checked in CreateAlert()
        // can add driverId and AlertId checks but thats redundant and unnecessary overhead
        const medicalRecord = await client.medicalInformation.findUnique({
            where: { driverId: driverId }
        });
        if (!medicalRecord) {
            throw new InternalErrors_1.HealthEventError("Medical Record Not Found");
        }
        // 2- fetch first-aid-guidance
        // classify vitals and fetch matching guidance rows
        const classifications = (0, classifyReadings_service_1.classifyReadings)(heartRate, temp, spo2);
        // this used to fetch exactly the guidance rows that match the driver's abnormal readings —no more, no less. 
        // Each OR condition is a pair, not individual fields,
        // so HIGH_HEART_RATE + MODERATE won't accidentally match HIGH_HEART_RATE + CRITICAL.
        const guidances = await client.firstAidGuidance.findMany({
            where: {
                OR: classifications.map(({ condition, severity }) => ({ condition, severity }))
            }
        });
        // 3- create healthEvent with readings + first-aid-guidance
        const healthEvent = await client.healthEvent.create({
            data: {
                temp: temp,
                heartRate: heartRate,
                spo2: spo2,
                recordId: medicalRecord.recordId,
                alertId: alertId,
                // connect matched guidance rows
                guidances: {
                    connect: guidances.map(g => ({ guidanceId: g.guidanceId }))
                }
            }, include: {
                guidances: true
            }
        });
        // 4- return health event + first-aid-guidance guidance 
        const response = await (0, firstAidGuidance_controller_1.getGuidance)(healthEvent.guidances);
        // null is added to always return response for compatabilty
        return { healthEvent, response: response !== null && response !== void 0 ? response : null };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new InternalErrors_1.HealthEventError(`Creating Health Event Failed: \n ${message}`);
    }
};
exports.createHealthEvent = createHealthEvent;
// the functions above AREN'T API services
