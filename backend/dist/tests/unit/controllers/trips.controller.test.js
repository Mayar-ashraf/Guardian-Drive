"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trips_controller_1 = require("../../../src/controllers/trips.controller");
const prisma_1 = require("../../../src/lib/prisma");
jest.mock("../../../src/lib/prisma", () => ({
    prisma: {
        driver: {
            findUnique: jest.fn(),
        },
        car: {
            findUnique: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        trip: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    },
}));
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe("createTrip Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should create trip successfully", async () => {
        const req = {
            validated: {
                body: {
                    plannedStartTime: new Date(Date.now() + 100000),
                    driverId: 1,
                    engineId: "ENG123",
                    fleetManagerId: 5,
                },
            },
        };
        const res = mockResponse();
        // mock driver
        prisma_1.prisma.driver.findUnique.mockResolvedValue({
            id: 1,
            medicalInformation: {
                bloodType: "A+",
            },
        });
        // mock car
        prisma_1.prisma.car.findUnique.mockResolvedValue({
            engineId: "ENG123",
        });
        // mock fleet manager
        prisma_1.prisma.user.findUnique.mockResolvedValue({
            id: 5,
            role: "FLEET_MANAGER",
        });
        // no duplicate trip
        prisma_1.prisma.trip.findFirst.mockResolvedValue(null);
        // created trip
        prisma_1.prisma.trip.create.mockResolvedValue({
            tripId: "trip-1",
            status: "PLANNED",
        });
        await (0, trips_controller_1.createTrip)(req, res);
        expect(prisma_1.prisma.trip.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Trip created successfully",
            trip: {
                tripId: "trip-1",
                status: "PLANNED",
            },
        });
    });
    it("should return 400 if plannedStartTime is in the past", async () => {
        const req = {
            validated: {
                body: {
                    plannedStartTime: new Date(Date.now() - 100000),
                },
            },
        };
        const res = mockResponse();
        await (0, trips_controller_1.createTrip)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "plannedStartTime cannot be in the past",
        });
    });
    it("should return 422 if driver does not exist", async () => {
        const req = {
            validated: {
                body: {
                    plannedStartTime: new Date(Date.now() + 100000),
                    driverId: 1,
                    fleetManagerId: 5,
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.driver.findUnique.mockResolvedValue(null);
        await (0, trips_controller_1.createTrip)(req, res);
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: "Driver doesn't exist",
        });
    });
    it("should return 409 if duplicate trip exists", async () => {
        const req = {
            validated: {
                body: {
                    plannedStartTime: new Date(Date.now() + 100000),
                    driverId: 1,
                    fleetManagerId: 5,
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.driver.findUnique.mockResolvedValue({
            id: 1,
            medicalInformation: {},
        });
        prisma_1.prisma.user.findUnique.mockResolvedValue({
            id: 5,
            role: "FLEET_MANAGER",
        });
        prisma_1.prisma.trip.findFirst.mockResolvedValue({
            tripId: "existing-trip",
        });
        await (0, trips_controller_1.createTrip)(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            message: "Trip already exists for this driver at the given planned start time",
        });
    });
    it("should return 500 on server error", async () => {
        const req = {
            validated: {
                body: {
                    plannedStartTime: new Date(Date.now() + 100000),
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.user.findUnique.mockRejectedValue(new Error("DB Error"));
        await (0, trips_controller_1.createTrip)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Server Error",
        });
    });
});
