import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums";
import { id } from "zod/locales";
export const getAllusers = async (req: express.Request, res: express.Response) => {
    try {
        const role = req.user?.role;

        if (role === Role.DRIVER) {
            return res.status(403).json({ message: "You are unauthorized to make this request" });
        }

        const trips = await prisma.trip.findMany();
        if (role === Role.ADMIN) {

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    fName: true,
                    lName: true,
                    phone: true,
                    address: true,

                    driver: {
                        select: {
                            drivingLicense: true,
                            avgHealthReadings: true,
                            medicalInformation: true
                        }
                    }
                }
            });

            const Users = users.map((user) => {

                if (user.role === Role.DRIVER && user.driver) {
                    return {
                        ...user,
                        driver: {
                            ...user.driver,
                            trips: trips.filter(t => t.driverId === user.id)
                        }
                    };
                }
                if (user.role === Role.FLEET_MANAGER) {
                    return {
                        ...user,
                        trips: trips.filter(t => t.fleetManagerId === user.id)
                    };
                }
                const { driver, ...cleanUser } = user;
                return cleanUser;
            });

            return res.json(Users);
        }
        if (role === Role.FLEET_MANAGER) {

            const users = await prisma.user.findMany({
                where: { role: Role.DRIVER },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    fName: true,
                    lName: true,
                    phone: true,
                    address: true,

                    driver: {
                        select: {
                            drivingLicense: true,
                            avgHealthReadings: true,
                            medicalInformation: true
                        }
                    }
                }
            });

            const Drivers = users.map((user) => {
                const driverTrips = trips.filter(t => t.driverId === user.id);

                return {
                    ...user,
                    ...(user.driver && {
                        driver: {
                            ...user.driver,
                            trips: driverTrips
                        }
                    })
                };
            });

            return res.json(Drivers);
        }

        return res.status(403).json({
            message: "unauthorized"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
export const getuserbyID = async (req: express.Request, res: express.Response) => {
    try {
        const caller = req.user;
        const role = caller?.role;
        const ID = Number(req.params.id);

        if (isNaN(ID)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const trips = await prisma.trip.findMany();

        const user = await prisma.user.findUnique({
            where: { id: ID },
            select: {
                id: true,
                email: true,
                role: true,
                fName: true,
                lName: true,
                phone: true,
                address: true,

                driver: {
                    select: {
                        drivingLicense: true,
                        avgHealthReadings: true,
                        medicalInformation: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { driver, ...baseUser } = user;

        const driverWithTrips =
            driver
                ? {
                    ...driver,
                    trips: trips.filter(t => t.driverId === user.id)
                }
                : undefined;

        const fleetTrips = trips.filter(t => t.fleetManagerId === user.id);
        if (role === Role.ADMIN) {

            if (user.role === Role.DRIVER) {
                return res.json({
                    ...baseUser,
                    ...(driverWithTrips ? { driver: driverWithTrips } : {})
                });
            }

            if (user.role === Role.FLEET_MANAGER) {
                return res.json({
                    ...baseUser,
                    trips: fleetTrips
                });
            }

            return res.json(baseUser);
        }

        if (role === Role.FLEET_MANAGER) {

            if (user.role !== Role.DRIVER) {
                return res.status(403).json({
                    message: "You can only access drivers"
                });
            }

            return res.json({
                ...baseUser,
                ...(driverWithTrips ? { driver: driverWithTrips } : {})
            });
        }
        if (role === Role.DRIVER) {

            if (caller?.userId !== ID) {
                return res.status(403).json({
                    message: "You can only access your own profile"
                });
            }

            return res.json({
                ...baseUser,
                ...(driverWithTrips ? { driver: driverWithTrips } : {})
            });
        }

        return res.status(403).json({ message: "Unauthorized" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
export const edituserbyID = async (req: express.Request, res: express.Response) => {
    try {
        const role = req.user?.role;
        if (!role || role !== Role.ADMIN) {
            return res.status(403).json({
                message: "You are unauthorized to make this request",
            });
        }

        const userId = Number(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const { email, fName, lName, phone, address } = req.body;

        const data: any = {};
        if (email) data.email = email;
        if (fName) data.fName = fName;
        if (lName) data.lName = lName;
        if (phone) data.phone = phone;
        if (address) data.address = address;

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                fName: true,
                lName: true,
                phone: true,
                address: true,
                driver: true
            }
        });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                role: true,
                fName: true,
                lName: true,
                phone: true,
                address: true,

                driver: {
                    select: {
                        drivingLicense: true,
                        avgHealthReadings: true,
                        medicalInformation: true
                    }
                }
            }
        });
        const { driver, ...baseUser } = updatedUser;

        return res.status(200).json({
            ...baseUser,
            ...(driver ? { driver } : {})
        });

    } catch (error) {
        console.error("Edit user error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const deleteuserbyID = async (req: express.Request, res: express.Response) => {
    try {
        const role = req.user?.role;

        if (role !== Role.ADMIN) {
            return res.status(403).json({ message: "unauthorized" });
        }

        const userId = Number(req.params.id);
        const { newFleetManagerId } = req.body;
        const { newdriverID } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role == Role.DRIVER) {
            const trips = await prisma.trip.findMany({
                where: { driverId: userId }
            });
            if (trips.length > 0 && !newdriverID) {
                return res.status(400).json({ message: "this driver has trips ,give newdriverID to reassign them" });
            }
            if (newdriverID) {
                const newdriver = await prisma.user.findUnique({
                    where: { id: newdriverID }
                });

                if (!newdriver || newdriver.role != Role.DRIVER) {
                    return res.status(400).json({ message: "invalid new driver id " });
                }

                await prisma.trip.updateMany({
                    where: { driverId: userId },
                    data: { driverId: newdriverID }
                });
            }

        }

        if (user.role === Role.FLEET_MANAGER) {

            const trips = await prisma.trip.findMany({
                where: { fleetManagerId: userId }
            });

            if (trips.length > 0 && !newFleetManagerId) {
                return res.status(400).json({
                    message: "This fleet manager has trips ,give newFleetManagerId to reassign them."
                });
            }

            if (newFleetManagerId) {
                const newManager = await prisma.user.findUnique({
                    where: { id: newFleetManagerId }
                });

                if (!newManager || newManager.role !== Role.FLEET_MANAGER) {
                    return res.status(400).json({
                        message: "Invalid new fleet manager"
                    });
                }

                await prisma.trip.updateMany({
                    where: { fleetManagerId: userId },
                    data: { fleetManagerId: newFleetManagerId }
                });
            }
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return res.json({ message: "User deleted successfully and trips are reassigned" });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
