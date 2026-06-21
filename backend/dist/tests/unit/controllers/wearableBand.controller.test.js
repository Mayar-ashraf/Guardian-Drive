"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wearableBands_controller_1 = require("../../../src/controllers/wearableBands.controller");
const prisma_1 = require("../../../src/lib/prisma");
jest.mock("../../../src/lib/prisma", () => ({
    prisma: {
        wearableBand: {
            create: jest.fn(),
        },
        driver: {
            findUnique: jest.fn(),
        },
    },
}));
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe("addWearableBand Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    // SUCCESS CASE
    it("should create wearable band successfully", async () => {
        const req = {
            validated: {
                body: {
                    deviceId: 1,
                    sensorList: ["heart", "gps"],
                    batteryLevel: 90,
                    isConnected: true,
                    driverId: 2,
                },
            },
        };
        const res = mockResponse();
        // mock driver exists and has no wearable band
        prisma_1.prisma.driver.findUnique.mockResolvedValue({
            id: 2,
            wearableBand: null,
        });
        // mock wearable band creation
        prisma_1.prisma.wearableBand.create.mockResolvedValue({
            deviceId: 1,
            sensorList: ["heart", "gps"],
            batteryLevel: 90,
            isConnected: true,
            driverId: 2,
        });
        await (0, wearableBands_controller_1.addWearableBand)(req, res);
        expect(prisma_1.prisma.driver.findUnique).toHaveBeenCalled();
        expect(prisma_1.prisma.wearableBand.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
    // DRIVER NOT FOUND
    it("should return 400 if driver does not exist", async () => {
        const req = {
            validated: {
                body: {
                    driverId: 2,
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.driver.findUnique.mockResolvedValue(null);
        await (0, wearableBands_controller_1.addWearableBand)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Driver with this driver id does not exist.",
        });
    });
    // DRIVER ALREADY HAS BAND
    it("should return 400 if driver already owns wearable band", async () => {
        const req = {
            validated: {
                body: {
                    driverId: 2,
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.driver.findUnique.mockResolvedValue({
            id: 2,
            wearableBand: {
                deviceId: 10,
            },
        });
        await (0, wearableBands_controller_1.addWearableBand)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Driver with this driver id already owns a wearable band.",
        });
    });
    // DUPLICATE BAND (P2002 error)
    it("should return 400 if wearable band already exists", async () => {
        const req = {
            validated: {
                body: {
                    deviceId: 1,
                    driverId: 2,
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.driver.findUnique.mockResolvedValue({
            id: 2,
            wearableBand: null,
        });
        prisma_1.prisma.wearableBand.create.mockRejectedValue({
            code: "P2002",
        });
        await (0, wearableBands_controller_1.addWearableBand)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Band already exists.",
        });
    });
});
