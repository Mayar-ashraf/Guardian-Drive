import { Request, Response } from "express"
import { prisma } from "../lib/prisma";
import { sendError, sendSuccess } from "../utils/HttpResponses";
import { Role } from "../../generated/prisma/enums";
import { id } from "zod/locales";
import { date } from "zod";
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
            slowestResponseMinutes: resolvedCount > 0 ? fastestResponseTime : 0,
            fastestResponseMinutes: resolvedCount > 0 ? slowestResponseTime : 0
        });
    }
    catch (error) {
        return sendError(res);
    }
}

/* alerts_per_driver_object
{
  "driver_id": integer,
  "driver_name": string,
  "total_alerts": int
}
*/
export const alertsPerDriverReport = async (req: Request, res: Response) => {
  try {
    const driverId = Number(req.validated!.params.driverId);

    const { from, to } = req.validated!.query;

    if (isNaN(driverId)) {
      return res.status(400).json({ message: "Invalid driverId" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const driver = await prisma.user.findFirst({
      where: {
        id: driverId,
        role: Role.DRIVER
      },
      select: {
        id: true,
        fName: true,
        lName: true
      }
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const totalAlerts = await prisma.alert.count({
      where: {
        generatedAt: {
          gte: fromDate,
          lte: toDate
        },
        trip: {
          driverId: driverId
        }
      }
    });

    return res.status(200).json({
      driver_id: driver.id,
      driver_name: `${driver.fName} ${driver.lName}`,
      total_alerts: totalAlerts
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
/*
alerts_per_condition_object
{
  "condition": string,
  "total_alerts": int,
}
*/
export const alertsPerConditionReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.validated!.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const alerts = await prisma.alert.findMany({
      where: {
        generatedAt: {
          gte: fromDate,
          lte: toDate
        }
      },
      include: {
        healthEvent: true
      }
    });

    const counts: Record<string, number> = {};

    for (const alert of alerts) {
      if (!alert.healthEvent) continue;

      const heartRate = parseInt(alert.healthEvent.heartRate);
      const temp = alert.healthEvent.temp;

      let condition = "normal";

      if (heartRate > 100) {
        condition = "high_heart_rate";
      } else if (heartRate < 60) {
        condition = "low_heart_rate";
      } else if (temp > 38) {
        condition = "fever";
      }

      counts[condition] = (counts[condition] || 0) + 1;
    }

    const result = Object.entries(counts).map(([condition, total]) => ({
      condition,
      total_alerts: total
    }));

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};