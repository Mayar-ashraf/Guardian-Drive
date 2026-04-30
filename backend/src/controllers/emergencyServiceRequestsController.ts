import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
import { requestStatus } from "../../generated/prisma/enums";
/*
POST /api/emergency-service-requests 
GET /api/emergency-services-requests
GET  /api/emergency-services-requests/:emergencyRequestId
PATCH  /api/emergency_service_requests/:emergencyRequestId
DELETE  /api/emergency-services-requests/:emergencyRequestId
*/
async function createEmergencyServiceRequest(req: Request, res: Response) {
    //   requestId        Int           @id @default(autoincrement())
    //   status           requestStatus
    //   requestTime      DateTime      @default(now())
    //   phone            String
    //   completionTime   DateTime?
    //   hospitalAssigned String

    //   alertId Int   @unique
    //   alert   Alert @relation(fields: [alertId], references: [alertId], onDelete: Cascade)
    // }
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
        const emergencyServiceRequest = await prisma.emergencyServiceRequest.create({
            data: {
                ...validatedData,
                status: requestStatus.REQUESTED,

            }
        })
        return res.status(201).json({ message: "Emergency service request created successfully", emergencyServiceRequest });

    } catch (error) {
        return res.status(500).json({ message: "Server Error" })

    }
}
async function readEmerencyServiceRequests(req: Request, res: Response) {
    try {
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
            }) //like

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
        const emergencyServiceRequest = await prisma.emergencyServiceRequest.update({
            where: {
                requestId: requestId
            },
            data: validatedBody
        })
        return res.status(200).json({ emergencyServiceRequest });

    } catch (error: any) {
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