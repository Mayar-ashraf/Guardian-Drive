import { prisma } from "../lib/prisma";
import { HealthEventError } from "../utils/InternalErrors";
import { ConditionSeverity, ConditionType, Prisma } from "../../generated/prisma/client";
import { getGuidance } from "./firstAidGuidance.controller";

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
        const classifications = classifyReadings(heartRate, temp, spo2);



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
            }
        })

        // 4- return health event + first-aid-guidance guidance 
        const response = await getGuidance(alertId)

        // null is added to always return response for compatabilty
        return { healthEvent, response: response ?? null }
    }
    catch (error) {
        throw new HealthEventError("Creating Health Event Failed")
    }

}


// helper function to classify the vitals for the correct condition - and then - guidance

const classifyReadings = (heartRate: number, spo2: number, temp: number): { condition: ConditionType; severity: ConditionSeverity }[] => {
    const results: { condition: ConditionType; severity: ConditionSeverity }[] = [];

    // Heart Rate
    if (heartRate > 150) results.push({ condition: ConditionType.HIGH_HEART_RATE, severity: ConditionSeverity.CRITICAL });
    else if (heartRate > 120) results.push({ condition: ConditionType.HIGH_HEART_RATE, severity: ConditionSeverity.MODERATE });
    else if (heartRate > 100) results.push({ condition: ConditionType.HIGH_HEART_RATE, severity: ConditionSeverity.MILD });
    else if (heartRate < 40) results.push({ condition: ConditionType.LOW_HEART_RATE, severity: ConditionSeverity.CRITICAL });
    else if (heartRate < 50) results.push({ condition: ConditionType.LOW_HEART_RATE, severity: ConditionSeverity.MODERATE });
    else if (heartRate < 60) results.push({ condition: ConditionType.LOW_HEART_RATE, severity: ConditionSeverity.MILD });

    // SPO2
    if (spo2 < 88) results.push({ condition: ConditionType.LOW_SPO2, severity: ConditionSeverity.CRITICAL });
    else if (spo2 < 92) results.push({ condition: ConditionType.LOW_SPO2, severity: ConditionSeverity.MODERATE });
    else if (spo2 < 95) results.push({ condition: ConditionType.LOW_SPO2, severity: ConditionSeverity.MILD });

    // Temperature
    if (temp > 39.5) results.push({ condition: ConditionType.HIGH_TEMP, severity: ConditionSeverity.CRITICAL });
    else if (temp > 38) results.push({ condition: ConditionType.HIGH_TEMP, severity: ConditionSeverity.MODERATE });
    else if (temp > 37.5) results.push({ condition: ConditionType.HIGH_TEMP, severity: ConditionSeverity.MILD });
    else if (temp < 35) results.push({ condition: ConditionType.LOW_TEMP, severity: ConditionSeverity.CRITICAL });
    else if (temp < 36) results.push({ condition: ConditionType.LOW_TEMP, severity: ConditionSeverity.MODERATE });

    // fallback — readings appear normal but alert was still triggered
    // can add General Type in conditionType and use it as fallback condition But for now let it be like that
    if (results.length === 0) {
        results.push({ condition: ConditionType.HIGH_HEART_RATE, severity: ConditionSeverity.MILD });
    }

    return results
};
// the functions above AREN'T API services