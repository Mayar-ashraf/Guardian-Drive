"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCar = exports.getCarById = exports.getAllCars = void 0;
exports.updateCar = updateCar;
exports.deleteCar = deleteCar;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../../generated/prisma/enums");
const getAllCars = async (req, res) => {
    var _a, _b;
    try {
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!role) {
            return res.status(401).json({ message: "Missing or invalid token" });
        }
        if (role === enums_1.Role.DRIVER) {
            return res.status(403).json({ message: "you are unauthorized to make this request" });
        }
        const { status, color, plateNo } = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.query;
        const cars = await prisma_1.prisma.car.findMany({
            where: Object.assign(Object.assign(Object.assign({}, (status && {
                status: String(status).toUpperCase(),
            })), (color && {
                color: {
                    contains: String(color),
                    mode: "insensitive",
                },
            })), (plateNo && {
                plateNo: {
                    contains: String(plateNo),
                    mode: "insensitive",
                },
            })),
        });
        return res.status(200).json({ cars });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllCars = getAllCars;
const getCarById = async (req, res) => {
    var _a;
    try {
        const { engineId } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Missing or invalid token" });
        }
        const car = await prisma_1.prisma.car.findUnique({
            where: { engineId },
            include: {
                trips: true,
            },
        });
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        if (user.role === enums_1.Role.DRIVER) {
            const ownsCar = car.trips.some((trip) => trip.driverId === user.userId);
            if (!ownsCar) {
                return res.status(403).json({
                    message: "You are not allowed to access this car",
                });
            }
        }
        return res.status(200).json({ car });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getCarById = getCarById;
const createCar = async (req, res) => {
    var _a;
    try {
        /* const caller = req.user;
     
         if (!caller) {
           return res.status(401).json({ message: "Missing or invalid token" });
         }
     
         if (caller.role === Role.DRIVER || caller.role === Role.FLEET_MANAGER) {
           return res.status(403).json({ message: "You are unauthorized to make this request " });
         }*/
        const { engineId, plateNo, color, status } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.body;
        if (!engineId || !plateNo || !color) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const car = await prisma_1.prisma.car.create({
            data: {
                engineId,
                plateNo,
                color,
                status: status || "ACTIVE" //default
            }
        });
        return res.status(201).json({ message: "Car created", car });
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Car already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.createCar = createCar;
async function updateCar(req, res) {
    var _a, _b;
    try {
        const engineId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.engineId;
        const updates = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.body;
        const car = await prisma_1.prisma.car.update({
            where: { engineId: engineId },
            data: updates
        });
        return res.status(200).json({ car });
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Car not found" });
        }
        return res.status(500).json({ message: "Server Error" });
    }
}
async function deleteCar(req, res) {
    var _a;
    try {
        const engineId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.engineId;
        await prisma_1.prisma.car.delete({
            where: {
                engineId: engineId
            }
        });
        return res.status(204).send();
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Car not found" });
        }
        return res.status(500).json({ message: "Server Error" });
    }
}
