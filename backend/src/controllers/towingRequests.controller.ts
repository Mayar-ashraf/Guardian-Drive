import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { requestStatus } from "../../generated/prisma/enums";

export const createTowingRequest = async (req: Request, res: Response) => {
  try {
    const { tripId, alertId, towingCompany, status } = req.validated?.body;

    const trip = await prisma.trip.findUnique({
      where: { tripId },
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const alert = await prisma.alert.findUnique({
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

    const existingRequest = await prisma.towingRequest.findUnique({
      where: { tripId },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "This trip already has a towing request",
      });
    }

    const request = await prisma.towingRequest.create({
      data: {
        tripId,
        alertId,
        towingCompany,
        status: status || requestStatus.REQUESTED,
      },
    });

    return res.status(201).json({
      message: "Request created successfully",
      data: request,
    });
  } catch (error) {
    console.error("Create error:", error);
    return res.status(500).json({ message: "Error creating towing request" });
  }
};


export const getTowingRequests = async (req: Request, res: Response) => {
  try {
    const {
      status,
      towingCompany,
      car,
      requestTime,
      completionTime,
      fleetManagerId
    } = req.validated?.query;

    const requests = await prisma.towingRequest.findMany({
      where: {
        ...(status && { status }),
        ...(towingCompany && { towingCompany }),

        ...(requestTime && { requestTime }),
        ...(completionTime && { completionTime }),

        ...(car && {
          trip: {
            car: {
              engineId: car,
            },
          },
        }),
        ...(fleetManagerId && {
          trip: {
            fleetManagerId: fleetManagerId
          },
        }),
      },

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
  } catch (error) {
    console.error("Get all error:", error);
    return res.status(500).json({ message: "Error getting towing requests" });
  }
};


export const getTowingRequestById = async (req: Request, res: Response) => {
  try {
    const { towingRequestId } = req.validated?.params;

    const request = await prisma.towingRequest.findUnique({
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
  } catch (error) {
    console.error("Get by ID error:", error);
    return res.status(500).json({ message: "Error getting towing request" });
  }
};


export const updateTowingRequest = async (req: Request, res: Response) => {
  try {
    const { towingRequestId } = req.validated?.params;
    const { status, completionTime, towingCompany } = req.validated?.body;

    const existing = await prisma.towingRequest.findUnique({
      where: { requestId: towingRequestId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (status === requestStatus.COMPLETED && !completionTime) {
      return res.status(400).json({
        message: "completionTime is required when status is COMPLETED",
      });
    }

    const updated = await prisma.towingRequest.update({
      where: { requestId: towingRequestId },
      data: {
        ...(status && { status }),
        ...(completionTime && { completionTime }),
        ...(towingCompany && { towingCompany }),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteTowingRequest = async (req: Request, res: Response) => {
  try {
    const { towingRequestId } = req.validated?.params;

    const existing = await prisma.towingRequest.findUnique({
      where: { requestId: towingRequestId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Request not found" });
    }

    await prisma.towingRequest.delete({
      where: { requestId: towingRequestId },
    });

    return res.status(200).json({
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};