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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomThresholds = exports.updateMedicalRecord = exports.createMedicalRecord = exports.getMedicalRecordById = exports.getMedicalRecords = void 0;
const prisma_1 = require("../lib/prisma");
const HttpResponses = __importStar(require("../utils/HttpResponses"));
const getMedicalRecords = async (req, res) => {
    try {
        const medicalRecords = await prisma_1.prisma.medicalInformation.findMany();
        return HttpResponses.sendSuccess(res, medicalRecords, "Medical records retrieved successfully");
    }
    catch (error) {
        return HttpResponses.sendError(res);
    }
};
exports.getMedicalRecords = getMedicalRecords;
const getMedicalRecordById = async (req, res) => {
    var _a, _b;
    try {
        const driverId = (_b = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.driverId;
        const driver = await prisma_1.prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }
        const medicalRecord = await prisma_1.prisma.medicalInformation.findUnique({
            where: { driverId: driverId },
        });
        if (!medicalRecord) {
            return HttpResponses.sendNotFound(res, "Medical Record Not found");
        }
        return HttpResponses.sendSuccess(res, medicalRecord);
    }
    catch (error) {
        return HttpResponses.sendError(res);
    }
};
exports.getMedicalRecordById = getMedicalRecordById;
const createMedicalRecord = async (req, res) => {
    var _a, _b, _c;
    try {
        const driverId = (_b = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.driverId;
        const driver = await prisma_1.prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }
        const medicalRecordExists = await prisma_1.prisma.medicalInformation.findUnique({
            where: { driverId },
        });
        if (medicalRecordExists) {
            return HttpResponses.sendError(res, "Medical Records for this driver already exists", 409);
        }
        const { conditions, medications, minHeartRate, maxHeartRate, avgHeartRate, minSpo2, maxSpo2, avgSpo2, minTemp, maxTemp, avgTemp } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.body;
        const medicalRecord = await prisma_1.prisma.medicalInformation.create({
            data: {
                driverId,
                conditions,
                medications,
                maxTemp: maxTemp !== null && maxTemp !== void 0 ? maxTemp : avgTemp + 0.5,
                minTemp: minTemp !== null && minTemp !== void 0 ? minTemp : avgTemp - 0.5,
                avgTemp: avgTemp,
                minSpo2: maxSpo2 !== null && maxSpo2 !== void 0 ? maxSpo2 : avgSpo2 - 2.5,
                maxSpo2: minSpo2 !== null && minSpo2 !== void 0 ? minSpo2 : 100,
                avgSpo2: avgSpo2,
                maxHeartRate: maxHeartRate !== null && maxHeartRate !== void 0 ? maxHeartRate : avgHeartRate + 20,
                minHeartRate: minHeartRate !== null && minHeartRate !== void 0 ? minHeartRate : avgHeartRate - 20,
                avgHeartRate: avgHeartRate,
            },
        });
        return HttpResponses.sendCreated(res, medicalRecord, "Medical Record Created Successfully");
    }
    catch (error) {
        return HttpResponses.sendError(res); // Server Failed
    }
};
exports.createMedicalRecord = createMedicalRecord;
const updateMedicalRecord = async (req, res) => {
    var _a, _b, _c;
    try {
        const driverId = (_b = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.driverId;
        // the only parameters right now other than avg health readings , Can add later BloodPressure too? and Blood Type?
        const { conditions, medications, minHeartRate, maxHeartRate, avgHeartRate, minSpo2, maxSpo2, avgSpo2, minTemp, maxTemp, avgTemp } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.body;
        // check if the driver i am looking for his records exits at all
        const driver = await prisma_1.prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }
        const driverMedicalInfo = await prisma_1.prisma.medicalInformation.findUnique({
            where: { driverId },
        });
        if (!driverMedicalInfo) {
            return HttpResponses.sendNotFound(res, "Medical record not found for this driver");
        }
        const updatedMedicalInfo = await prisma_1.prisma.medicalInformation.update({
            where: { driverId },
            data: {
                conditions: conditions ? { push: conditions } : undefined,
                medications: medications ? { push: medications } : undefined,
                minHeartRate: minHeartRate !== null && minHeartRate !== void 0 ? minHeartRate : driverMedicalInfo.minHeartRate,
                maxHeartRate: maxHeartRate !== null && maxHeartRate !== void 0 ? maxHeartRate : driverMedicalInfo.maxHeartRate,
                avgHeartRate: avgHeartRate !== null && avgHeartRate !== void 0 ? avgHeartRate : driverMedicalInfo.avgHeartRate,
                minSpo2: minSpo2 !== null && minSpo2 !== void 0 ? minSpo2 : driverMedicalInfo.minSpo2,
                maxSpo2: maxSpo2 !== null && maxSpo2 !== void 0 ? maxSpo2 : driverMedicalInfo.maxSpo2,
                avgSpo2: avgSpo2 !== null && avgSpo2 !== void 0 ? avgSpo2 : driverMedicalInfo.avgSpo2,
                minTemp: minTemp !== null && minTemp !== void 0 ? minTemp : driverMedicalInfo.minTemp,
                maxTemp: maxTemp !== null && maxTemp !== void 0 ? maxTemp : driverMedicalInfo.maxTemp,
                avgTemp: avgTemp !== null && avgTemp !== void 0 ? avgTemp : driverMedicalInfo.avgTemp,
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
    }
    catch (error) {
        return HttpResponses.sendError(res);
    }
};
exports.updateMedicalRecord = updateMedicalRecord;
const getCustomThresholds = async (req, res) => {
    var _a;
    try {
        const driverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const driver = await prisma_1.prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            return HttpResponses.sendNotFound(res, "Driver not found");
        }
        const customThresholds = await prisma_1.prisma.medicalInformation.findUnique({
            where: { driverId: driverId },
            select: {
                minHeartRate: true, maxHeartRate: true, avgHeartRate: true,
                minSpo2: true, maxSpo2: true, avgSpo2: true,
                minTemp: true, maxTemp: true, avgTemp: true
            },
        });
        if (!customThresholds) {
            return HttpResponses.sendNotFound(res, "Thresholds Not found");
        }
        return HttpResponses.sendSuccess(res, customThresholds);
    }
    catch (error) {
        return HttpResponses.sendError(res);
    }
};
exports.getCustomThresholds = getCustomThresholds;
