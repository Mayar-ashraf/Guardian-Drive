"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWearableBand = exports.deleteWearableBand = exports.addWearableBand = exports.getWearableBandById = exports.getAllWearableBands = void 0;
const prisma_1 = require("../lib/prisma");
const HttpResponses_1 = require("../utils/HttpResponses");
const getAllWearableBands = async (req, res) => {
    try {
        const { deviceId, driverId, isConnected, sensor, limit, page, orderBy } = req.validated.query; // used ! instead of ? because validation ran, so validated should exist
        const normalizedSensor = sensor === null || sensor === void 0 ? void 0 : sensor.toLowerCase();
        const whereConditions = Object.assign(Object.assign(Object.assign(Object.assign({}, (deviceId && { deviceId })), (driverId && { driverId })), (isConnected !== undefined && { isConnected })), (normalizedSensor && { sensorList: { has: normalizedSensor } }));
        const skip = (page - 1) * limit;
        const wearableBands = await prisma_1.prisma.wearableBand.findMany({
            where: whereConditions,
            take: limit,
            skip: skip,
            orderBy: {
                deviceId: orderBy
            }
        });
        if (wearableBands.length === 0) { // wearableBands can be [] or [value1, value2,...]
            return (0, HttpResponses_1.sendNotFound)(res, "No wearable bands found.");
        }
        return (0, HttpResponses_1.sendSuccess)(res, { message: "Success", data: wearableBands });
    }
    catch (error) {
        return (0, HttpResponses_1.sendError)(res);
    }
};
exports.getAllWearableBands = getAllWearableBands;
const getWearableBandById = async (req, res) => {
    try {
        const deviceId = req.validated.params.deviceId;
        const wearableBand = await prisma_1.prisma.wearableBand.findUnique({ where: { deviceId } });
        const user = req.user;
        if (!wearableBand) {
            return (0, HttpResponses_1.sendNotFound)(res, "Wearable Band Not Found.");
        }
        const isADMIN = ((user === null || user === void 0 ? void 0 : user.role) === "ADMIN");
        const isAuthorizedDriver = ((user === null || user === void 0 ? void 0 : user.role) === "DRIVER" && wearableBand.driverId === user.userId);
        // console.log("REQ USER:", req.user);
        if (!isADMIN && !isAuthorizedDriver) {
            return (0, HttpResponses_1.sendUnauthorized)(res, "You are unauthorized to access this wearable band");
        }
        return res.json({ wearableBand });
    }
    catch (error) {
        console.error(error);
        return (0, HttpResponses_1.sendError)(res);
    }
};
exports.getWearableBandById = getWearableBandById;
const addWearableBand = async (req, res) => {
    try {
        const body = req.validated.body;
        if (body.driverId) { // check if driver with this driver id exists 
            const driver = await prisma_1.prisma.driver.findUnique({
                where: {
                    id: body.driverId
                },
                include: {
                    wearableBand: true
                }
            });
            if (!driver) {
                return (0, HttpResponses_1.sendBadRequest)(res, "Driver with this driver id does not exist.");
            }
            if (driver.wearableBand) {
                return (0, HttpResponses_1.sendBadRequest)(res, "Driver with this driver id already owns a wearable band.");
            }
        }
        const addedWearableBand = await prisma_1.prisma.wearableBand.create(({
            data: body
        }));
        return (0, HttpResponses_1.sendCreated)(res, addedWearableBand, "Wearable Band added successfully");
    }
    catch (error) {
        if (error.code === "P2002") {
            return (0, HttpResponses_1.sendBadRequest)(res, "Band already exists.");
        }
        return (0, HttpResponses_1.sendError)(res);
    }
};
exports.addWearableBand = addWearableBand;
const deleteWearableBand = async (req, res) => {
    try {
        const deviceId = req.validated.params.deviceId;
        await prisma_1.prisma.wearableBand.delete({
            where: { deviceId: deviceId }
        });
        return (0, HttpResponses_1.sendSuccess)(res, "Wearable Band deleted successully");
    }
    catch (error) {
        if (error.code === "P2025") {
            return (0, HttpResponses_1.sendNotFound)(res, "Wearable band not found");
        }
        console.error(error);
        return (0, HttpResponses_1.sendError)(res);
    }
};
exports.deleteWearableBand = deleteWearableBand;
const updateWearableBand = async (req, res) => {
    try {
        const body = req.validated.body;
        const deviceId = req.validated.params.deviceId;
        if (body.driverId) {
            const driver = await prisma_1.prisma.driver.findUnique({
                where: {
                    id: body.driverId
                },
                include: {
                    wearableBand: true
                }
            });
            if (!driver) {
                return (0, HttpResponses_1.sendBadRequest)(res, "Driver with this driver id does not exist.");
            }
            if (driver.wearableBand && driver.wearableBand.deviceId !== deviceId) {
                return (0, HttpResponses_1.sendBadRequest)(res, "Driver with this driver id already owns a wearable band.");
            }
        }
        await prisma_1.prisma.wearableBand.update({
            where: {
                deviceId: deviceId
            },
            data: req.validated.body
        });
        return (0, HttpResponses_1.sendSuccess)(res, "Wearable band updated successfully");
    }
    catch (error) {
        if (error.code === "P2025") {
            return (0, HttpResponses_1.sendError)(res, "Wearable Band not found.");
        }
        return (0, HttpResponses_1.sendError)(res);
    }
};
exports.updateWearableBand = updateWearableBand;
