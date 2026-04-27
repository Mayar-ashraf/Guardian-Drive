import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums"; 
import { id } from "zod/locales";
import {CarFieldRefs } from './../../generated/prisma/models/Car';
export const getAllcars = async ( req:express.Request, res:express.Response)=>{
    try{
        const role =req.user?.role;
        if(role==Role.DRIVER){
            return res.status(403).json({message:"you are unauthorized to make this request"});
        }
        const cars = await prisma.car.findMany({
            include: {
                trips: true,
            },
        });
        return res.json({ cars });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:"internal server error"});


    }
}
export const getCarbyID = async (req: express.Request, res: express.Response) => {
    try {
        const caller = req.user;

        if (!caller) {
            return res.status(401).json({
                message: "Missing or invalid authentication token."
            });
        }

        const ID = Array.isArray(req.params.carId) ? req.params.carId[0] : req.params.carId;

        if (!ID) {
            return res.status(400).json({ message: "Invalid Car ID" });
        }

        const car = await prisma.car.findUnique({
            where: { engineId: ID },
            include: { trips: true }
        });

        if (!car) {
            return res.status(404).json({ message: "Car Not Found." });
        }

        if (caller.role === Role.DRIVER) {
            const allowed = car.trips.some(t => t.driverId === caller.userId);

            if (!allowed) {
                return res.status(403).json({
                    message: "You are unauthorized to make this request."
                });
            }
        }

        return res.status(200).json(car);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}; 
 
export const createCar = async (req: express.Request, res: express.Response) => {
  try {
      const caller = req.user;

        if (!caller) {
            return res.status(401).json({
                message: "Missing or invalid authentication token."
            });
        }
        if(caller.role==Role.DRIVER||caller.role==Role.FLEET_MANAGER){
            return res.status(403).json({message:"you are unauthorized to make this request "});
        }
    const { engineId, plateNo, color, status } = req.body;

    if (!engineId || !plateNo || !color) {
      return res.status(400).json({message: "fields are missing " });
    }

    const car = await prisma.car.create({
      data: {
        engineId,
        plateNo,
        color,
        status, 
      },
    });

    res.status(201).json({  message: "Car created successfully", car,});
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "engine id already exists",});
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};