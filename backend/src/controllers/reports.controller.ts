import { Request, Response } from "express"
import { prisma } from "../lib/prisma";
import { sendError, sendSuccess } from "../utils/HttpResponses";
/*
{
    "period": {
        "from": Date,
        "to": Date
    },
    "total_emergency_requests": int,
    "resolved_emergency_requests": int,
    "pending_emergency_requests": int,
    "avg_emergency_response_time_minutes": float,
    "slowestResponseMinutes": float,
    "fastestResponseMinutes": float
}
*/
export const emergencyPerformanceReport = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.validated!.query;

        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        const emergencies = await prisma.emergencyServiceRequest.findMany({
            where: {
                requestTime: {
                    gte: from,
                    lte: endDate
                },
            }
        });

        if (emergencies.length === 0) {
            return sendSuccess(res, {
                total_emergency_requests: 0,
                avg_response_time: 0
            })
        }
        let totalResponseTime = 0;
        let resolvedCount = 0;

        let fastestResponseTime = Infinity;
        let slowestResponseTime = -Infinity;


        for (const emg of emergencies) {
            if (emg.status === "COMPLETED" && emg.completionTime) {
                const diff = emg.completionTime!.getTime() - emg.requestTime.getTime();
                const minutes = diff / 60000
                totalResponseTime += minutes;
                resolvedCount++;

                if (minutes < fastestResponseTime) {
                    fastestResponseTime = minutes;
                }
                if (minutes > slowestResponseTime) {
                    slowestResponseTime = minutes;
                }
            }
        }
        const avgResponseTime = resolvedCount > 0 ? (totalResponseTime / resolvedCount) : 0;
        
        return sendSuccess(res, {
            period: {
                from: from,
                to: endDate
            },
            total_emergency_requests: emergencies.length,
            resolved_emergency_requests: resolvedCount,
            avg_emergency_response_time_minutes: avgResponseTime,
            pending_emergency_requests: emergencies.length - resolvedCount,
            slowestResponseMinutes: resolvedCount > 0 ? fastestResponseTime: 0,
            fastestResponseMinutes: resolvedCount > 0 ? slowestResponseTime: 0
        });
    }
    catch (error) {
        return sendError(res);
    }
}