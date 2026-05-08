import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums";
import { id } from "zod/locales";
import { CarFieldRefs } from '../../generated/prisma/models/Car';
import { Request, Response } from "express"
export const getAllCars = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    if (role === Role.DRIVER) {
      return res.status(403).json({ message: "you are unauthorized to make this request" });
    }

    const { status, color, plateNo } = req.validated?.query;

    const cars = await prisma.car.findMany({
      where: {
        ...(status && {
          status: String(status).toUpperCase(),
        }),
        ...(color && {
          color: {
            contains: String(color),
            mode: "insensitive",
          },
        }),
        ...(plateNo && {
          plateNo: {
            contains: String(plateNo),
            mode: "insensitive",
          },
        }),
      },
    });

    return res.status(200).json({ cars });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getCarById = async (req: Request, res: Response) => {
  try {
    const { engineId } = req.validated?.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const car = await prisma.car.findUnique({
      where: { engineId },
      include: {
        trips: true,
      },
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (user.role === Role.DRIVER) {
      const ownsCar = car.trips.some(
        (trip) => trip.driverId === user.userId
      );

      if (!ownsCar) {
        return res.status(403).json({
          message: "You are not allowed to access this car",
        });
      }
    }

    return res.status(200).json({ car });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const createCar = async (req: Request, res: Response) => {
  try {
    /* const caller = req.user;
 
     if (!caller) {
       return res.status(401).json({ message: "Missing or invalid token" });
     }
 
     if (caller.role === Role.DRIVER || caller.role === Role.FLEET_MANAGER) {
       return res.status(403).json({ message: "You are unauthorized to make this request " });
     }*/

    const { engineId, plateNo, color, status } = req.validated?.body;

    if (!engineId || !plateNo || !color) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const car = await prisma.car.create({
      data: {
        engineId,
        plateNo,
        color,
        status: status || "ACTIVE"//default
      }
    });

    return res.status(201).json({ message: "Car created", car });

  } catch (error: any) {

    if (error.code === "P2002") {
      return res.status(400).json({ message: "Car already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
async function updateCar(req: Request, res: Response) {

  try {
    const engineId = req.validated?.params.engineId
    const updates = req.validated?.body
    const car = await prisma.car.update({
      where: { engineId: engineId },
      data: updates
    })
    return res.status(200).json({ car });

  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Car not found" });
    }
    return res.status(500).json({ message: "Server Error" })
  }
}
async function deleteCar(req: Request, res: Response) {
  try {
    const engineId = req.validated?.params.engineId
    await prisma.car.delete({
      where: {
        engineId: engineId
      }
    })
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Car not found" });
    }
    return res.status(500).json({ message: "Server Error" })
  }

}
export { updateCar, deleteCar }