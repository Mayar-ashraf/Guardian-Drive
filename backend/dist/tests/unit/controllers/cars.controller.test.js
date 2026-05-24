"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cars_controller_1 = require("../../../src/controllers/cars.controller");
const prisma_1 = require("../../../src/lib/prisma");
jest.mock("../../../src/lib/prisma", () => ({
    prisma: {
        car: {
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
describe("createCar Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should create car successfully", async () => {
        const req = {
            validated: {
                body: {
                    engineId: "ENG123",
                    plateNo: "ABC-123",
                    color: "Red",
                    status: "ACTIVE",
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.car.create.mockResolvedValue({
            id: 1,
            engineId: "ENG123",
            plateNo: "ABC-123",
            color: "Red",
            status: "ACTIVE",
        });
        await (0, cars_controller_1.createCar)(req, res);
        expect(prisma_1.prisma.car.create).toHaveBeenCalledWith({
            data: {
                engineId: "ENG123",
                plateNo: "ABC-123",
                color: "Red",
                status: "ACTIVE",
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Car created",
            car: expect.any(Object),
        });
    });
    it("should set default status if not provided", async () => {
        const req = {
            validated: {
                body: {
                    engineId: "ENG123",
                    plateNo: "ABC-123",
                    color: "Red",
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.car.create.mockResolvedValue({
            id: 1,
            engineId: "ENG123",
            plateNo: "ABC-123",
            color: "Red",
            status: "ACTIVE",
        });
        await (0, cars_controller_1.createCar)(req, res);
        expect(prisma_1.prisma.car.create).toHaveBeenCalledWith({
            data: {
                engineId: "ENG123",
                plateNo: "ABC-123",
                color: "Red",
                status: "ACTIVE",
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });
    it("should return 400 if missing required fields", async () => {
        const req = {
            validated: {
                body: {
                    engineId: "",
                    plateNo: "",
                    color: "",
                },
            },
        };
        const res = mockResponse();
        await (0, cars_controller_1.createCar)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing fields",
        });
    });
    it("should return 400 if Prisma duplicate error (P2002)", async () => {
        const req = {
            validated: {
                body: {
                    engineId: "ENG123",
                    plateNo: "ABC-123",
                    color: "Red",
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.car.create.mockRejectedValue({
            code: "P2002",
        });
        await (0, cars_controller_1.createCar)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Car already exists",
        });
    });
    it("should return 500 on unexpected error", async () => {
        const req = {
            validated: {
                body: {
                    engineId: "ENG123",
                    plateNo: "ABC-123",
                    color: "Red",
                },
            },
        };
        const res = mockResponse();
        prisma_1.prisma.car.create.mockRejectedValue(new Error("Database crash"));
        await (0, cars_controller_1.createCar)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error",
        });
    });
});
