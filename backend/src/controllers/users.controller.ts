import express from "express";
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums";
import { id } from "zod/locales";
import { validate } from "../validators/validate";
export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const role = req.user?.role;
        const userId = req.user?.userId;
        if (role === Role.DRIVER) {
            return res.status(403).json({ message: "You are unauthorized to make this request" });
        }

        const { role: roleQuery, email, name } = req.validated?.query;
        const where: any = {};

        if (roleQuery) {
            where.role = roleQuery;
        }

        if (email) {
            where.email = {
                contains: email as string,
                mode: "insensitive"
            };
        }

        if (name) {
            where.OR = [
                { fName: { startsWith: name as string, mode: "insensitive" } },
                { lName: { startsWith: name as string, mode: "insensitive" } }
            ];
        }
        if (role === Role.FLEET_MANAGER) {
            where.role = Role.DRIVER;
        }
        const users = await prisma.user.findMany({
            where,
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
        const trips = await prisma.trip.findMany({
            where: {
                ...(role === Role.FLEET_MANAGER && { fleetManagerId: userId })
            }
        });
        const result = users.map((user) => {
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

        return res.status(200).json(result);

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



        const ID = Number(req.validated?.params.id);

        /*   if (isNaN(ID)) {
               return res.status(400).json({ message: "Invalid user id" });
           }*/

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
        if (role == Role.DRIVER) {
            return res.status(403).json({ message: "You can only access your own profile" });
        }
        if (!user) {

            return res.status(400).json({ message: "User not found" });

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
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

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
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

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

        const userId = Number(req.validated?.params.id);

        /*  if (isNaN(userId)) {
              return res.status(400).json({ message: "Invalid user id" });
          }*/

        const { email, fName, lName, phone, address } = req.validated?.body;

        const data: any = {};
        if (email) data.email = email;
        if (fName) data.fName = fName;
        if (lName) data.lName = lName;
        if (phone) data.phone = phone;
        if (address) data.address = address;

        /*if (Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update",
            });
        }*/

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
            return res.status(403).json({
                message: "You are unauthorized to make this request"
            });
        }

        const userId = Number(req.validated?.params.id);


        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === Role.ADMIN) {
            await prisma.user.delete({
                where: { id: userId }
            });

            return res.status(200).json({
                message: "Admin deleted successfully"
            });
        }
        const { newFleetManagerId, newDriverId } = req.validated?.body;
       
        if (user.role === Role.DRIVER) {

            const tripsCount = await prisma.trip.count({
                where: { driverId: userId }
            });


            if (tripsCount > 0) {

                if (!newDriverId) {
                    return res.status(400).json({ message: "Please Provide new driver ID to reassign trips" });
                }
                if (newFleetManagerId) {
                    return res.status(400).json({
                        message: "Driver deletion requires newDriverID only "
                    });
                }

                if (newDriverId === userId) {
                    return res.status(400).json({
                        message: "Cannot reassign to the same driver"
                    });
                }

                const newDriver = await prisma.user.findFirst({
                    where: {
                        id: newDriverId,
                        role: Role.DRIVER
                    }
                });

                if (!newDriver) {
                    return res.status(400).json({
                        message: "Invalid new driver ID"
                    });
                }

                await prisma.trip.updateMany({
                    where: { driverId: userId },
                    data: { driverId: newDriverId }
                });
            }
        }


        if (user.role === Role.FLEET_MANAGER) {

            const tripsCount = await prisma.trip.count({
                where: { fleetManagerId: userId }
            });



            if (tripsCount > 0) {
                if (newDriverId) {
                    return res.status(400).json({
                        message: "Fleet Manager deletion requires newFleetManagerId only"
                    });
                }
                if (!newFleetManagerId) {
                    return res.status(400).json({
                        message: "please provide new fleet manager ID to reassign trips"
                    });
                }

                if (newFleetManagerId === userId) {
                    return res.status(400).json({
                        message: "Cannot reassign to the same fleet manager"
                    });
                }

                const newManager = await prisma.user.findFirst({
                    where: {
                        id: newFleetManagerId,
                        role: Role.FLEET_MANAGER
                    }
                });

                if (!newManager) {
                    return res.status(400).json({
                        message: "Invalid fleet manager ID"
                    });
                }

                await prisma.trip.updateMany({
                    where: { fleetManagerId: userId },
                    data: { fleetManagerId: newFleetManagerId }
                });
            }
        }


        await prisma.user.delete({
            where: { id: userId }
        });

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};