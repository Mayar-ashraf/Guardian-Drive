"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmergencyServiceRequest = createEmergencyServiceRequest;
exports.readEmerencyServiceRequests = readEmerencyServiceRequests;
exports.getEmergencyServiceRequestById = getEmergencyServiceRequestById;
exports.updateEmergenceServiceRequest = updateEmergenceServiceRequest;
exports.deleteEmergencyServiceRequest = deleteEmergencyServiceRequest;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../../generated/prisma/enums");
async function createEmergencyServiceRequest(req, res) {
    var _a;
    try {
        const validatedData = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.body;
        const alert = await prisma_1.prisma.alert.findUnique({
            where: {
                alertId: validatedData.alertId
            }
        });
        if (!alert) {
            return res.status(422).json({ message: "Alert doesn't exist" });
        }
        const emergencyServiceRequestDuplicate = await prisma_1.prisma.emergencyServiceRequest.findUnique({
            where: {
                alertId: validatedData.alertId
            }
        });
        if (emergencyServiceRequestDuplicate) {
            return res.status(409).json({ message: "Emergency request already exists for this alert" });
        }
        const emergencyServiceRequest = await prisma_1.prisma.emergencyServiceRequest.create({
            data: Object.assign(Object.assign({}, validatedData), { status: enums_1.requestStatus.REQUESTED })
        });
        return res.status(201).json({ message: "Emergency service request created successfully", emergencyServiceRequest });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
}
async function readEmerencyServiceRequests(req, res) {
    var _a;
    // can he see all requests
    try {
        const user = req.user;
        const validatedQuery = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.query;
        const { limit, orderBy, page } = validatedQuery;
        const skip = (page - 1) * limit;
        const whereConditions = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (validatedQuery.status && { status: validatedQuery.status })), (validatedQuery.alertId && { alertId: validatedQuery.alertId })), (validatedQuery.phone && { phone: validatedQuery.phone })), (validatedQuery.hospitalAssigned && {
            hospitalAssigned: {
                contains: validatedQuery.hospitalAssigned
            }
        })), { alert: {
                trip: {
                    fleetManagerId: user === null || user === void 0 ? void 0 : user.userId
                }
            } });
        //from to request and completion
        const completionTimeFilter = {};
        if (validatedQuery.fromCompletionTime) {
            completionTimeFilter.gte = validatedQuery.fromCompletionTime;
        }
        if (validatedQuery.toCmpletionTime) {
            completionTimeFilter.lte = validatedQuery.toCompletionTime;
        }
        const requestTimeFilter = {};
        if (validatedQuery.fromRequestTime) {
            requestTimeFilter.gte = validatedQuery.fromRequestTime;
        }
        if (validatedQuery.toRequestTime) {
            requestTimeFilter.lte = validatedQuery.fromRequestTime;
        }
        if (Object.keys(completionTimeFilter).length > 0) {
            whereConditions.completionTime = completionTimeFilter;
        }
        if (Object.keys(requestTimeFilter).length > 0) {
            whereConditions.requestTime = requestTimeFilter;
        }
        const emerencyServiceRequests = await prisma_1.prisma.emergencyServiceRequest.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: {
                requestTime: validatedQuery.orderBy
            }
        });
        const total = await prisma_1.prisma.emergencyServiceRequest.count({
            where: whereConditions
        });
        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            emerencyServiceRequests
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
}
async function getEmergencyServiceRequestById(req, res) {
    var _a;
    try {
        const validatedParams = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const emergencyServiceRequest = await prisma_1.prisma.emergencyServiceRequest.findUnique({
            where: {
                requestId: validatedParams.requestId
            }
        });
        if (!emergencyServiceRequest) {
            return res.status(404).json({ message: "Emergency service request not found" });
        }
        return res.status(200).json({ emergencyServiceRequest });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
}
async function updateEmergenceServiceRequest(req, res) {
    var _a, _b;
    try {
        const requestId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.requestId;
        const validatedBody = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.body;
        if (validatedBody.status === "COMPLETED" && !validatedBody.completionTime) {
            validatedBody.completionTime = new Date();
        }
        const emergencyServiceRequest = await prisma_1.prisma.emergencyServiceRequest.update({
            where: {
                requestId: requestId
            },
            data: validatedBody
        });
        return res.status(200).json({ emergencyServiceRequest });
    }
    catch (error) {
        console.log(error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Emergency service request not found" });
        }
        return res.status(500).json({ message: "Server Error" });
    }
}
async function deleteEmergencyServiceRequest(req, res) {
    var _a;
    try {
        const requestId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.requestId;
        await prisma_1.prisma.emergencyServiceRequest.delete({
            where: {
                requestId: requestId
            }
        });
        return res.status(204).send();
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Emergency service request not found" });
        }
        return res.status(500).json({ message: "Server Error" });
    }
}
