import express from "express";
import { prisma } from "../lib/prisma";
import * as HttpResponses from "../utils/HttpResponses";

export const getMedicalRecords = async (req: express.Request, res: express.Response) => {
    try {
        const medicalRecords = await prisma.medicalInformation.findMany();
        return HttpResponses.sendSuccess(res, medicalRecords, "Medical records retrieved successfully");
    } catch (error) {
        return HttpResponses.sendError(res);
    }

}

export const getMedicalRecordById = async (req: express.Request, res: express.Response) => {
    try {
        const driverId = parseInt(req.params.driverId as string);
        if (isNaN(driverId)) {
            return HttpResponses.sendNotFound(res, "Invalid driverId");
        }

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
        const driverId = parseInt(req.params.driverId as string);
        if (isNaN(driverId)) {
            return HttpResponses.sendNotFound(res, "Invalid driverId");
        }

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

        const { conditions, medications } = req.body

        const medicalRecord = await prisma.medicalInformation.create({
            data: {
                driverId,
                conditions,
                medications,
            },
        });

        return HttpResponses.sendCreated(res, medicalRecord, "Medical Record Created Successfully")

    } catch (error) {
        return HttpResponses.sendError(res)     // Server Failed
    }
}



export const updateMedicalRecord = async (req: express.Request, res: express.Response) => {

    try {
        const driverId = parseInt(req.params.driverId as string);

        if (isNaN(driverId)) {
            return HttpResponses.sendNotFound(res, "Invalid driverId");
        }

        // the only parameters right now other than avg health readings , Can add later BloodPressure too? and Blood Type?
        const { conditions, medications } = req.body;

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
            data: {         // to push on an existing array instead of full replace, problem , Can't Remove only append
                conditions: conditions ? { push: conditions } : undefined,
                medications: medications ? { push: medications } : undefined,

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