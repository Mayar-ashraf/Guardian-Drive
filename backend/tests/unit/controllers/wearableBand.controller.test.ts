import { addWearableBand } from "../../../src/controllers/wearableBands.controller";
import { prisma } from "../../../src/lib/prisma";

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
  const res: any = {};
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

    const req: any = {
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
    (prisma.driver.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      wearableBand: null,
    });

    // mock wearable band creation
    (prisma.wearableBand.create as jest.Mock).mockResolvedValue({
      deviceId: 1,
      sensorList: ["heart", "gps"],
      batteryLevel: 90,
      isConnected: true,
      driverId: 2,
    });

    await addWearableBand(req, res);

    expect(prisma.driver.findUnique).toHaveBeenCalled();
    expect(prisma.wearableBand.create).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // DRIVER NOT FOUND
  it("should return 400 if driver does not exist", async () => {

    const req: any = {
      validated: {
        body: {
          driverId: 2,
        },
      },
    };

    const res = mockResponse();

    (prisma.driver.findUnique as jest.Mock).mockResolvedValue(null);

    await addWearableBand(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Driver with this driver id does not exist.",
    });
  });

  // DRIVER ALREADY HAS BAND
  it("should return 400 if driver already owns wearable band", async () => {

    const req: any = {
      validated: {
        body: {
          driverId: 2,
        },
      },
    };

    const res = mockResponse();

    (prisma.driver.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      wearableBand: {
        deviceId: 10,
      },
    });

    await addWearableBand(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Driver with this driver id already owns a wearable band.",
    });
  });

  // DUPLICATE BAND (P2002 error)
  it("should return 400 if wearable band already exists", async () => {

    const req: any = {
      validated: {
        body: {
          deviceId: 1,
          driverId: 2,
        },
      },
    };

    const res = mockResponse();

    (prisma.driver.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      wearableBand: null,
    });

    (prisma.wearableBand.create as jest.Mock).mockRejectedValue({
      code: "P2002",
    });

    await addWearableBand(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Band already exists.",
    });
  });

});