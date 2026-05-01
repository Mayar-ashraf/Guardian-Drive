import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
import { requestStatus } from "../../generated/prisma/enums";
async function createEmergencyServiceRequest(req: Request, res: Response) {
    try {
        const validatedData = req.validated?.body
        const alert = await prisma.alert.findUnique({
            where: {
                alertId: validatedData.alertId
            }
        })
        if (!alert) {
            return res.status(422).json({ message: "Alert doesn't exist" })
        }
        const emergencyServiceRequestDuplicate = await prisma.emergencyServiceRequest.findUnique({
            where: {
                alertId: validatedData.alertId
            }
        })
        if (emergencyServiceRequestDuplicate) {
            return res.status(409).json({ message: "Emergency request already exists for this alert" })
        }
        const emergencyServiceRequest = await prisma.emergencyServiceRequest.create({
            data: {
                ...validatedData,
                status: requestStatus.REQUESTED,

            }
        })
        return res.status(201).json({ message: "Emergency service request created successfully", emergencyServiceRequest });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server Error" })

    }
}
async function readEmerencyServiceRequests(req: Request, res: Response) {
    // can he see all requests
    try {
        const user = req.user
        const validatedQuery = req.validated?.query
        const { limit, orderBy, page } = validatedQuery
        const skip = (page - 1) * limit;
        const whereConditions = {
            ...(validatedQuery.status && { status: validatedQuery.status }),
            ...(validatedQuery.alertId && { alertId: validatedQuery.alertId }),
            ...(validatedQuery.phone && { phone: validatedQuery.phone }),
            ...(validatedQuery.hospitalAssigned && {
                hospitalAssigned: {
                    contains: validatedQuery.hospitalAssigned
                }
            }), //like
            alert: {
                trip: {
                    fleetManagerId: user?.userId
                }
            }
        }
        //from to request and completion
        const completionTimeFilter: any = {};
        if (validatedQuery.fromCompletionTime) {
            completionTimeFilter.gte = validatedQuery.fromCompletionTime
        }
        if (validatedQuery.toCmpletionTime) {
            completionTimeFilter.lte = validatedQuery.toCompletionTime
        }
        const requestTimeFilter: any = {}
        if (validatedQuery.fromRequestTime) {
            requestTimeFilter.gte = validatedQuery.fromRequestTime
        }
        if (validatedQuery.toRequestTime) {
            requestTimeFilter.lte = validatedQuery.fromRequestTime
        }
        if (Object.keys(completionTimeFilter).length > 0) {
            whereConditions.completionTime = completionTimeFilter;
        }
        if (Object.keys(requestTimeFilter).length > 0) {
            whereConditions.requestTime = requestTimeFilter;
        }
        const emerencyServiceRequests = await prisma.emergencyServiceRequest.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: {
                requestTime: validatedQuery.orderBy
            }
        })
        const total = await prisma.emergencyServiceRequest.count({
            where: whereConditions
        });
        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            emerencyServiceRequests
        })
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }

}
async function getEmergencyServiceRequestById(req: Request, res: Response) {
    try {
        const validatedParams = req.validated?.params
        const emergencyServiceRequest = await prisma.emergencyServiceRequest.findUnique({
            where: {
                requestId: validatedParams.requestId
            }
        })
        if (!emergencyServiceRequest) {
            return res.status(404).json({ message: "Emergency service request not found" });
        }
        return res.status(200).json({ emergencyServiceRequest });

    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
}
async function updateEmergenceServiceRequest(req: Request, res: Response) {
    try {
        const requestId = req.validated?.params.requestId
        const validatedBody = req.validated?.body
        if (validatedBody.status === "COMPLETED" && !validatedBody.completionTime) {
            validatedBody.completionTime = new Date()
        }
        const emergencyServiceRequest = await prisma.emergencyServiceRequest.update({
            where: {
                requestId: requestId
            },
            data: validatedBody
        })
        return res.status(200).json({ emergencyServiceRequest });

    } catch (error: any) {
        console.log(error)
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Emergency service request not found" });
        }
        return res.status(500).json({ message: "Server Error" })
    }
}
async function deleteEmergencyServiceRequest(req: Request, res: Response) {
    try {
        const requestId = req.validated?.params.requestId
        await prisma.emergencyServiceRequest.delete({
            where: {
                requestId: requestId
            }
        })
        return res.status(204).send();

    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Emergency service request not found" });
        }
        return res.status(500).json({ message: "Server Error" })
    }
}
export { createEmergencyServiceRequest, readEmerencyServiceRequests, getEmergencyServiceRequestById, updateEmergenceServiceRequest, deleteEmergencyServiceRequest }