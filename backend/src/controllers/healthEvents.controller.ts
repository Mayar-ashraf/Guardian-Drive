import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums";
import { id } from "zod/locales";
import { Request, Response } from "express"
import * as HttpResponses from "../utils/HttpResponses";

export const getHealthEventsByDriverId = async (
  req: Request,
  res: Response
) => {
  try {
    const driverId = req.validated?.params?.driverId;

    const medicalRecord = await prisma.medicalInformation.findUnique({
      where: {
        driverId,
      },
      include: {
        healthEvents: {
          orderBy: {
            eventDate: "desc",
          },
        },
      },
    });

    if (!medicalRecord) {
      return res.status(404).json({
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      healthEvents: medicalRecord.healthEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getHealthEvents = async (req: express.Request, res: express.Response) => {
    try {
        const healthEvents = await prisma.healthEvent.findMany();
        return HttpResponses.sendSuccess(res, healthEvents, "Medical records retrieved successfully");
    } catch (error) {
        return HttpResponses.sendError(res);
    }

}
