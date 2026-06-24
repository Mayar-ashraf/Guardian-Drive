import express from "express";
import { prisma } from "../lib/prisma";
import * as HttpResponses from "../utils/HttpResponses";

export const getAllMedicalRecords = async (req: express.Request, res: express.Response) => {
    try {
        const medicalRecords = await prisma.medicalInformation.findMany();
        return HttpResponses.sendSuccess(res, medicalRecords, "Medical records retrieved successfully");
    } catch (error) {
        return HttpResponses.sendError(res);
    }

}

export const getMedicalRecordById = async (req: express.Request, res: express.Response) => {
    try {
        const driverId = req.validated?.params?.driverId
        console.log(driverId);
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });

        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }

        const medicalRecord = await prisma.medicalInformation.findUnique({
            where: { driverId: driverId },
        });

        if (!medicalRecord) {
            return HttpResponses.sendNotFound(res, "Medical Record Not found")
        }

        return HttpResponses.sendSuccess(res, medicalRecord);

    } catch (error) {
        return HttpResponses.sendError(res);
    }


}

export const createMedicalRecord = async (req: express.Request, res: express.Response) => {

    try {
        const driverId = req.validated?.params?.driverId;

        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });

        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }

        const medicalRecordExists = await prisma.medicalInformation.findUnique({
            where: { driverId },
        });

        if (medicalRecordExists) {
            return HttpResponses.sendError(res, "Medical Records for this driver already exists", 409)
        }

        const {
            conditions, medications,
            minHeartRate, maxHeartRate, avgHeartRate,
            minSpo2, maxSpo2, avgSpo2,
            minTemp, maxTemp, avgTemp
        } = req.validated?.body;

        const medicalRecord = await prisma.medicalInformation.create({
            data: {
                driverId,
                conditions,
                medications,

                maxTemp: maxTemp ?? avgTemp + 0.5,
                minTemp: minTemp ?? avgTemp - 0.5,
                avgTemp: avgTemp,

                minSpo2: maxSpo2 ?? avgSpo2 - 2.5,
                maxSpo2: minSpo2 ?? 100,
                avgSpo2: avgSpo2,

                maxHeartRate: maxHeartRate ?? avgHeartRate + 20,
                minHeartRate: minHeartRate ?? avgHeartRate - 20,
                avgHeartRate: avgHeartRate,
            },
        });

        return HttpResponses.sendCreated(res, medicalRecord, "Medical Record Created Successfully")

    } catch (error) {
        return HttpResponses.sendError(res)     // Server Failed
    }
}



export const updateMedicalRecord = async (req: express.Request, res: express.Response) => {

    try {
        const driverId = req.validated?.params?.driverId;

        // the only parameters right now other than avg health readings , Can add later BloodPressure too? and Blood Type?
        const {
            conditions, medications,
            minHeartRate, maxHeartRate, avgHeartRate,
            minSpo2, maxSpo2, avgSpo2,
            minTemp, maxTemp, avgTemp
        } = req.validated?.body;

        // check if the driver i am looking for his records exits at all
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });

        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }


        const driverMedicalInfo = await prisma.medicalInformation.findUnique({
            where: { driverId },
        });

        if (!driverMedicalInfo) {
            return HttpResponses.sendNotFound(res, "Medical record not found for this driver");
        }

        const updatedMedicalInfo = await prisma.medicalInformation.update({
            where: { driverId },
            data: {
                conditions: conditions ? { push: conditions } : undefined,
                medications: medications ? { push: medications } : undefined,

                minHeartRate: minHeartRate ?? driverMedicalInfo.minHeartRate,
                maxHeartRate: maxHeartRate ?? driverMedicalInfo.maxHeartRate,
                avgHeartRate: avgHeartRate ?? driverMedicalInfo.avgHeartRate,

                minSpo2: minSpo2 ?? driverMedicalInfo.minSpo2,
                maxSpo2: maxSpo2 ?? driverMedicalInfo.maxSpo2,
                avgSpo2: avgSpo2 ?? driverMedicalInfo.avgSpo2,

                minTemp: minTemp ?? driverMedicalInfo.minTemp,
                maxTemp: maxTemp ?? driverMedicalInfo.maxTemp,
                avgTemp: avgTemp ?? driverMedicalInfo.avgTemp,
            },
        });

        /*  // Full Replace
            // Also can be for easy insert AND Removal But which is better (Do I want to remove previous ones? probably not)
            // The client is responsible for sending the complete updated list, e.g. to add a condition, client sends all existing conditions + the new one.
            const updatedMedicalInfo = await prisma.medicalInformation.update({
                where: { driverId },
                data: {
                    conditions: conditions ?? driverMedicalInfo.conditions,
                    medications: medications ?? driverMedicalInfo.medications,
                },
            });
        */

        return HttpResponses.sendSuccess(res, updatedMedicalInfo, "Medical record updated successfully");

    } catch (error) {
        return HttpResponses.sendError(res);
    }

}

export const getCustomThresholds = async (req: express.Request, res: express.Response) => {
    try {
        const driverId = req.user?.userId

        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
        });

        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }

        const customThresholds = await prisma.medicalInformation.findUnique({
            where: { driverId: driverId },
            select: {
                minHeartRate: true, maxHeartRate: true, avgHeartRate: true,
                minSpo2: true, maxSpo2: true, avgSpo2: true,
                minTemp: true, maxTemp: true, avgTemp: true
            },
        });

        if (!customThresholds) {
            return HttpResponses.sendNotFound(res, "Thresholds Not found")
        }

        return HttpResponses.sendSuccess(res, customThresholds);

    } catch (error) {
        return HttpResponses.sendError(res);
    }
}