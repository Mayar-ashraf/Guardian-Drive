import { createTrip } from "../../../src/controllers/trips.controller";
import { prisma } from "../../../src/lib/prisma";

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
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("createTrip Controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create trip successfully", async () => {

    const req: any = {
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
    (prisma.driver.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      medicalInformation: {
        bloodType: "A+",
      },
    });

    // mock car
    (prisma.car.findUnique as jest.Mock).mockResolvedValue({
      engineId: "ENG123",
    });

    // mock fleet manager
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 5,
      role: "FLEET_MANAGER",
    });

    // no duplicate trip
    (prisma.trip.findFirst as jest.Mock).mockResolvedValue(null);

    // created trip
    (prisma.trip.create as jest.Mock).mockResolvedValue({
      tripId: "trip-1",
      status: "PLANNED",
    });

    await createTrip(req, res);

    expect(prisma.trip.create).toHaveBeenCalled();

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

    const req: any = {
      validated: {
        body: {
          plannedStartTime: new Date(Date.now() - 100000),
        },
      },
    };

    const res = mockResponse();

    await createTrip(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "plannedStartTime cannot be in the past",
    });
  });

  it("should return 422 if driver does not exist", async () => {

    const req: any = {
      validated: {
        body: {
          plannedStartTime: new Date(Date.now() + 100000),
          driverId: 1,
          fleetManagerId: 5,
        },
      },
    };

    const res = mockResponse();

    (prisma.driver.findUnique as jest.Mock).mockResolvedValue(null);

    await createTrip(req, res);

    expect(res.status).toHaveBeenCalledWith(422);

    expect(res.json).toHaveBeenCalledWith({
      message: "Driver doesn't exist",
    });
  });

  it("should return 409 if duplicate trip exists", async () => {

    const req: any = {
      validated: {
        body: {
          plannedStartTime: new Date(Date.now() + 100000),
          driverId: 1,
          fleetManagerId: 5,
        },
      },
    };

    const res = mockResponse();

    (prisma.driver.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      medicalInformation: {},
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 5,
      role: "FLEET_MANAGER",
    });

    (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
      tripId: "existing-trip",
    });

    await createTrip(req, res);

    expect(res.status).toHaveBeenCalledWith(409);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Trip already exists for this driver at the given planned start time",
    });
  });

  it("should return 500 on server error", async () => {

    const req: any = {
      validated: {
        body: {
          plannedStartTime: new Date(Date.now() + 100000),
        },
      },
    };

    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB Error")
    );

    await createTrip(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Server Error",
    });
  });

});