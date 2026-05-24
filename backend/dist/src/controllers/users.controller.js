"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteuserbyID = exports.edituserbyID = exports.getuserbyID = exports.getAllUsers = void 0;
exports.createUser = createUser;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../../generated/prisma/enums");
const bcrypt_1 = __importDefault(require("bcrypt"));
const HttpResponses_1 = require("../utils/HttpResponses");
async function createUser(req, res) {
    var _a;
    try {
        const { email, fName, lName, password, phone, address, role, drivingLicense } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.body;
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { email: email }
        });
        if (userExists) {
            return res.status(400).json({ message: "User already exists!" });
        }
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
            const createdUser = await prisma_1.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: { email, fName, lName, password: hashedPassword, phone, address, role }
                });
                if (role === enums_1.Role.DRIVER) {
                    const driverInfo = await tx.driver.create({
                        data: { drivingLicense, user: { connect: { id: user.id } } }
                    });
                    return { user, driverInfo };
                }
                return user;
            });
            return (0, HttpResponses_1.sendCreated)(res, createdUser, "User Created Successfully");
        }
        catch (error) {
            //  return res.status(500).json({ message: "Server Error1" })
            console.error("FULL ERROR:", error);
            return res.status(500).json({
                message: "Server Error",
                error: error.message,
                stack: error.stack, // optional (remove later in production)
            });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error2" });
    }
}
const getAllUsers = async (req, res) => {
    var _a, _b, _c;
    try {
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (role === enums_1.Role.DRIVER) {
            return res.status(403).json({ message: "You are unauthorized to make this request" });
        }
        const { role: roleQuery, email, name } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.query;
        const where = {};
        if (roleQuery) {
            where.role = roleQuery;
        }
        if (email) {
            where.email = {
                contains: email,
                mode: "insensitive"
            };
        }
        if (name) {
            where.OR = [
                { fName: { startsWith: name, mode: "insensitive" } },
                { lName: { startsWith: name, mode: "insensitive" } }
            ];
        }
        if (role === enums_1.Role.FLEET_MANAGER) {
            where.role = enums_1.Role.DRIVER;
        }
        const users = await prisma_1.prisma.user.findMany({
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
        const trips = await prisma_1.prisma.trip.findMany({
            where: Object.assign({}, (role === enums_1.Role.FLEET_MANAGER && { fleetManagerId: userId }))
        });
        const result = users.map((user) => {
            if (user.role === enums_1.Role.DRIVER && user.driver) {
                return Object.assign(Object.assign({}, user), { driver: Object.assign(Object.assign({}, user.driver), { trips: trips.filter(t => t.driverId === user.id) }) });
            }
            if (user.role === enums_1.Role.FLEET_MANAGER) {
                return Object.assign(Object.assign({}, user), { trips: trips.filter(t => t.fleetManagerId === user.id) });
            }
            const { driver } = user, cleanUser = __rest(user, ["driver"]);
            return cleanUser;
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
exports.getAllUsers = getAllUsers;
const getuserbyID = async (req, res) => {
    var _a;
    try {
        const caller = req.user;
        const role = caller === null || caller === void 0 ? void 0 : caller.role;
        const ID = Number((_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.id);
        /*   if (isNaN(ID)) {
               return res.status(400).json({ message: "Invalid user id" });
           }*/
        const trips = await prisma_1.prisma.trip.findMany();
        const user = await prisma_1.prisma.user.findUnique({
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
                        medicalInformation: true,
                        wearableBand: true,
                    }
                }
            }
        });
        if (role === enums_1.Role.DRIVER && (caller === null || caller === void 0 ? void 0 : caller.userId) !== ID) {
            return res.status(403).json({
                message: "Drivers can only access their own profile",
            });
        }
        if (role == enums_1.Role.DRIVER && (caller === null || caller === void 0 ? void 0 : caller.userId) == ID) {
            const user = await prisma_1.prisma.user.findUnique({
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
                            medicalInformation: true,
                            wearableBand: true,
                        },
                    },
                },
            });
            return res.json(user);
        }
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const { driver } = user, baseUser = __rest(user, ["driver"]);
        const driverWithTrips = driver
            ? Object.assign(Object.assign({}, driver), { trips: trips.filter(t => t.driverId === user.id) }) : undefined;
        const fleetTrips = trips.filter(t => t.fleetManagerId === user.id);
        if (role === enums_1.Role.ADMIN) {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.role === enums_1.Role.DRIVER) {
                return res.json(Object.assign(Object.assign({}, baseUser), (driverWithTrips ? { driver: driverWithTrips } : {})));
            }
            if (user.role === enums_1.Role.FLEET_MANAGER) {
                return res.json(Object.assign(Object.assign({}, baseUser), { trips: fleetTrips }));
            }
            return res.json(baseUser);
        }
        if (role === enums_1.Role.FLEET_MANAGER) {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.role !== enums_1.Role.DRIVER) {
                return res.status(403).json({
                    message: "You can only access drivers"
                });
            }
            return res.json(Object.assign(Object.assign({}, baseUser), (driverWithTrips ? { driver: driverWithTrips } : {})));
        }
        return res.status(403).json({ message: "Unauthorized" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getuserbyID = getuserbyID;
const edituserbyID = async (req, res) => {
    var _a, _b, _c;
    try {
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!role || role !== enums_1.Role.ADMIN) {
            return res.status(403).json({
                message: "You are unauthorized to make this request",
            });
        }
        const userId = Number((_b = req.validated) === null || _b === void 0 ? void 0 : _b.params.id);
        /*  if (isNaN(userId)) {
              return res.status(400).json({ message: "Invalid user id" });
          }*/
        const { email, fName, lName, phone, address } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.body;
        const data = {};
        if (email)
            data.email = email;
        if (fName)
            data.fName = fName;
        if (lName)
            data.lName = lName;
        if (phone)
            data.phone = phone;
        if (address)
            data.address = address;
        /*if (Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update",
            });
        }*/
        const existingUser = await prisma_1.prisma.user.findUnique({
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
        const updatedUser = await prisma_1.prisma.user.update({
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
        const { driver } = updatedUser, baseUser = __rest(updatedUser, ["driver"]);
        return res.status(200).json(Object.assign(Object.assign({}, baseUser), (driver ? { driver } : {})));
    }
    catch (error) {
        console.error("Edit user error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
exports.edituserbyID = edituserbyID;
const deleteuserbyID = async (req, res) => {
    var _a, _b, _c;
    try {
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (role !== enums_1.Role.ADMIN) {
            return res.status(403).json({
                message: "You are unauthorized to make this request"
            });
        }
        const userId = Number((_b = req.validated) === null || _b === void 0 ? void 0 : _b.params.id);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.role === enums_1.Role.ADMIN) {
            await prisma_1.prisma.user.delete({
                where: { id: userId }
            });
            return res.status(200).json({
                message: "Admin deleted successfully"
            });
        }
        const { newFleetManagerId, newDriverId } = (_c = req.validated) === null || _c === void 0 ? void 0 : _c.body;
        if (user.role === enums_1.Role.DRIVER) {
            const tripsCount = await prisma_1.prisma.trip.count({
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
                const newDriver = await prisma_1.prisma.user.findFirst({
                    where: {
                        id: newDriverId,
                        role: enums_1.Role.DRIVER
                    }
                });
                if (!newDriver) {
                    return res.status(400).json({
                        message: "Invalid new driver ID"
                    });
                }
                await prisma_1.prisma.trip.updateMany({
                    where: { driverId: userId },
                    data: { driverId: newDriverId }
                });
            }
        }
        if (user.role === enums_1.Role.FLEET_MANAGER) {
            const tripsCount = await prisma_1.prisma.trip.count({
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
                const newManager = await prisma_1.prisma.user.findFirst({
                    where: {
                        id: newFleetManagerId,
                        role: enums_1.Role.FLEET_MANAGER
                    }
                });
                if (!newManager) {
                    return res.status(400).json({
                        message: "Invalid fleet manager ID"
                    });
                }
                await prisma_1.prisma.trip.updateMany({
                    where: { fleetManagerId: userId },
                    data: { fleetManagerId: newFleetManagerId }
                });
            }
        }
        await prisma_1.prisma.user.delete({
            where: { id: userId }
        });
        return res.status(200).json({
            message: "User deleted successfully"
        });
    }
    catch (error) {
        console.error("DELETE ERROR:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
exports.deleteuserbyID = deleteuserbyID;
