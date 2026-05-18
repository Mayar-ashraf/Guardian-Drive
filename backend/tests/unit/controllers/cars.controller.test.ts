import { createCar } from "../../../src/controllers/cars.controller";
import { prisma } from "../../../src/lib/prisma";

jest.mock("../../../src/lib/prisma", () => ({
  prisma: {
    car: {
      create: jest.fn(),
    },
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("createCar Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create car successfully", async () => {
    const req: any = {
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

    (prisma.car.create as jest.Mock).mockResolvedValue({
      id: 1,
      engineId: "ENG123",
      plateNo: "ABC-123",
      color: "Red",
      status: "ACTIVE",
    });

    await createCar(req, res);

    expect(prisma.car.create).toHaveBeenCalledWith({
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
    const req: any = {
      validated: {
        body: {
          engineId: "ENG123",
          plateNo: "ABC-123",
          color: "Red",
        },
      },
    };

    const res = mockResponse();

    (prisma.car.create as jest.Mock).mockResolvedValue({
      id: 1,
      engineId: "ENG123",
      plateNo: "ABC-123",
      color: "Red",
      status: "ACTIVE",
    });

    await createCar(req, res);

    expect(prisma.car.create).toHaveBeenCalledWith({
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
    const req: any = {
      validated: {
        body: {
          engineId: "",
          plateNo: "",
          color: "",
        },
      },
    };

    const res = mockResponse();

    await createCar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing fields",
    });
  });

  it("should return 400 if Prisma duplicate error (P2002)", async () => {
    const req: any = {
      validated: {
        body: {
          engineId: "ENG123",
          plateNo: "ABC-123",
          color: "Red",
        },
      },
    };

    const res = mockResponse();

    (prisma.car.create as jest.Mock).mockRejectedValue({
      code: "P2002",
    });

    await createCar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Car already exists",
    });
  });

  it("should return 500 on unexpected error", async () => {
    const req: any = {
      validated: {
        body: {
          engineId: "ENG123",
          plateNo: "ABC-123",
          color: "Red",
        },
      },
    };

    const res = mockResponse();

    (prisma.car.create as jest.Mock).mockRejectedValue(
      new Error("Database crash")
    );

    await createCar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});