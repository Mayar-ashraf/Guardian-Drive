"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTowingRequest = exports.updateTowingRequest = exports.getTowingRequestById = exports.getTowingRequests = exports.createTowingRequest = void 0;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../../generated/prisma/enums");
const createTowingRequest = async (req, res) => {
    var _a;
    try {
        const { tripId, alertId, towingCompany, status } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.body;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { tripId },
        });
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        const alert = await prisma_1.prisma.alert.findUnique({
            where: { alertId },
        });
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }
        if (alert.tripId !== tripId) {
            return res.status(400).json({
                message: "Alert does not belong to this trip",
            });
        }
        const existingRequest = await prisma_1.prisma.towingRequest.findUnique({
            where: { tripId },
        });
        if (existingRequest) {
            return res.status(400).json({
                message: "This trip already has a towing request",
            });
        }
        const request = await prisma_1.prisma.towingRequest.create({
            data: {
                tripId,
                alertId,
                towingCompany,
                status: status || enums_1.requestStatus.REQUESTED,
            },
        });
        return res.status(201).json({
            message: "Request created successfully",
            data: request,
        });
    }
    catch (error) {
        console.error("Create error:", error);
        return res.status(500).json({ message: "Error creating towing request" });
    }
};
exports.createTowingRequest = createTowingRequest;
const getTowingRequests = async (req, res) => {
    var _a;
    try {
        const { status, towingCompany, car, requestTime, completionTime, } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.query;
        const requests = await prisma_1.prisma.towingRequest.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (status && { status })), (towingCompany && { towingCompany })), (requestTime && { requestTime })), (completionTime && { completionTime })), (car && {
                trip: {
                    car: {
                        engineId: car,
                    },
                },
            })),
            include: {
                trip: {
                    include: {
                        car: true,
                    },
                },
                alert: true,
            },
            orderBy: {
                requestTime: "desc",
            },
        });
        return res.status(200).json({
            message: "Towing requests fetched successfully",
            data: requests,
        });
    }
    catch (error) {
        console.error("Get all error:", error);
        return res.status(500).json({ message: "Error getting towing requests" });
    }
};
exports.getTowingRequests = getTowingRequests;
const getTowingRequestById = async (req, res) => {
    var _a;
    try {
        const { towingRequestId } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const request = await prisma_1.prisma.towingRequest.findUnique({
            where: { requestId: towingRequestId },
            include: {
                trip: {
                    include: {
                        car: true,
                    },
                },
                alert: true,
            },
        });
        if (!request) {
            return res.status(404).json({ message: "Towing request not found" });
        }
        return res.status(200).json(request);
    }
    catch (error) {
        console.error("Get by ID error:", error);
        return res.status(500).json({ message: "Error getting towing request" });
    }
};
exports.getTowingRequestById = getTowingRequestById;
const updateTowingRequest = async (req, res) => {
    var _a, _b;
    try {
        const { towingRequestId } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const { status, completionTime, towingCompany } = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.body;
        const existing = await prisma_1.prisma.towingRequest.findUnique({
            where: { requestId: towingRequestId },
        });
        if (!existing) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (status === enums_1.requestStatus.COMPLETED && !completionTime) {
            return res.status(400).json({
                message: "completionTime is required when status is COMPLETED",
            });
        }
        const updated = await prisma_1.prisma.towingRequest.update({
            where: { requestId: towingRequestId },
            data: Object.assign(Object.assign(Object.assign({}, (status && { status })), (completionTime && { completionTime })), (towingCompany && { towingCompany })),
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateTowingRequest = updateTowingRequest;
const deleteTowingRequest = async (req, res) => {
    var _a;
    try {
        const { towingRequestId } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const existing = await prisma_1.prisma.towingRequest.findUnique({
            where: { requestId: towingRequestId },
        });
        if (!existing) {
            return res.status(404).json({ message: "Request not found" });
        }
        await prisma_1.prisma.towingRequest.delete({
            where: { requestId: towingRequestId },
        });
        return res.status(200).json({
            message: "Request deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteTowingRequest = deleteTowingRequest;
