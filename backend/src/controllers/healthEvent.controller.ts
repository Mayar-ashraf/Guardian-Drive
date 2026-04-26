import express from "express"
import { prisma } from "../lib/prisma";
import { HealthEventError } from "../utils/InternalErrors";
import { Prisma } from "../../generated/prisma/client";


// only system can do it (is only called from CreateAlert() ), no route to this function -> therefore no Http Req and Res
// note this is now always created as transaction - created with alert atomically
export const createHealthEvent = async (heartRange: string, temp: number, alertId: number, driverId: number, firstAidGuidance?: string, tx?: Prisma.TransactionClient) => {
    const client = tx ?? prisma;  // use transaction if provided, otherwise use prisma
    try {
        // driverId and AlertId already checked in CreateAlert()
        // can add driverId and AlertId checks but thats redundant and unnecessary overhead
        const medicalRecord = await client.medicalInformation.findUnique({
            where: { driverId: driverId }
        })
        if (!medicalRecord) {
            throw new HealthEventError("Medical Record Not Found")
        }

        const healthEvent = await client.healthEvent.create({
            data: {
                temp: temp,
                heartRate: heartRange,
                recordId: medicalRecord.recordId,
                alertId: alertId,
                firstAidGuidance: firstAidGuidance ?? undefined,
            }
        })

        return healthEvent
    }
    catch (error) {
        throw new HealthEventError("Server Failed")
    }

}

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

export const updateHealthEvent = async (alertId: number, firstAidGuidance: string) => {
    try {
        const healthEvent = await prisma.healthEvent.update({
            where: { alertId: alertId },
            data: { firstAidGuidance: firstAidGuidance }
        });
        return healthEvent
    }
    catch (error) {
        throw new HealthEventError("Server Failed")
    }

}
// the functions above AREN'T API services