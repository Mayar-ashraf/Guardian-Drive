import { prisma } from "../lib/prisma";
import { HealthEventError } from "../utils/InternalErrors";
import { ConditionSeverity, ConditionType, Prisma } from "../../generated/prisma/client";
import { getGuidance } from "../controllers/firstAidGuidance.controller";
import { classifyReadings } from "./classifyReadings.service";

// can return HealthEvent type or null
export const getHealthEventByAlertId = async (alertId: number) => {
    try {
        const healthEvent = await prisma.healthEvent.findUnique({
            where: { alertId: alertId }
        })
        return healthEvent
    }
    catch (error) {
        throw new HealthEventError("Server Failed")
    }
}

// only system can do it (is only called from CreateAlert() ), no route to this function -> therefore no Http Req and Res
// note this is now always created as transaction - created with alert atomically
export const createHealthEvent = async (heartRate: number, temp: number, spo2: number,
    alertId: number, driverId: number, tx?: Prisma.TransactionClient) => {
    const client = tx ?? prisma;  // use transaction if provided, otherwise use prisma
    try {
        // 1- check valid records

        // driverId and AlertId already checked in CreateAlert()
        // can add driverId and AlertId checks but thats redundant and unnecessary overhead
        const medicalRecord = await client.medicalInformation.findUnique({
            where: { driverId: driverId }
        })
        if (!medicalRecord) {
            throw new HealthEventError("Medical Record Not Found")
        }

        // 2- fetch first-aid-guidance

        // classify vitals and fetch matching guidance rows
        const classifications = classifyReadings(heartRate, temp, spo2, medicalRecord);



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
        })

        // 4- return health event + first-aid-guidance guidance 
        const guidanceStrings = await getGuidance(healthEvent.guidances)       // translate guidances into the strings

        // null is added to always return same response for compatabilty
        return { healthEvent, guidanceStrings: guidanceStrings ?? null }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new HealthEventError(`Creating Health Event Failed: \n ${message}`);
    }

}

// the functions above AREN'T API services