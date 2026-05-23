import {
  prisma
} from "../src/lib/prisma";
import {
  alertType,
  alertStatus,
} from "../generated/prisma/client";

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log("🌱 Seeding database...");

  // -------------------------
  // 1. Fleet Manager
  // -------------------------
  const manager = await prisma.user.upsert({
    where: { email: "manager@test.com" },
    update: {},
    create: {
      email: "manager@test.com",
      fName: "Fleet",
      lName: "Manager",
      password: "hashed",
      address: "Alexandria",
      role: "FLEET_MANAGER",
    },
  });

  // -------------------------
  // 2. Driver
  // -------------------------
  const driverUser = await prisma.user.upsert({
    where: { email: "driver@test.com" },
    update: {},
    create: {
      email: "driver@test.com",
      fName: "Test",
      lName: "Driver",
      password: "hashed",
      address: "Alexandria",
      role: "DRIVER",
    },
  });

  const driver = await prisma.driver.create({
    data: {
      id: driverUser.id,
      drivingLicense: "LIC-001",
    },
  });

  // -------------------------
  // 3. Trip
  // -------------------------
  const trip = await prisma.trip.create({
    data: {
      fleetManagerId: manager.id,
      driverId: driver.id,
      status: "ONGOING",
      plannedStartTime: new Date(),
      startLatitude: 31.2,
      startLongitude: 29.9,
      destLatitude: 31.25,
      destLongitude: 29.95,
    },
  });

  // -------------------------
  // 4. Locations
  // -------------------------
  const locations = [];

  let lat = 31.2;
  let lng = 29.9;

  for (let i = 0; i < 30; i++) {
    lat += (Math.random() - 0.5) * 0.002;
    lng += (Math.random() - 0.5) * 0.002;

    const loc = await prisma.location.create({
      data: {
        tripId: trip.tripId,
        latitude: lat,
        longitude: lng,
      },
    });

    locations.push(loc);
  }

  // -------------------------
  // 5. Alerts (REALISTIC)
  // -------------------------
  const alerts = [];

  for (let i = 0; i < 100; i++) {
    const isSOS = Math.random() < 0.05;
    const isResolved = Math.random() < 0.5;

    const triggered = pick(locations);
    const stopped = isResolved ? pick(locations) : null;

    const generatedAt = new Date(
      Date.now() - rand(0, 2 * 60 * 60 * 1000)
    );

    alerts.push({
      type: isSOS
        ? alertType.SOS
        : alertType.HEALTH_ABNORMAL,

      status: isResolved
        ? alertStatus.RESOLVED
        : alertStatus.ACTIVE,

      tripId: trip.tripId,
      triggeredLocationId: triggered.locationId,
      stoppedLocationId: stopped?.locationId ?? null,

      generatedAt,

      solvedAt: isResolved
        ? new Date(generatedAt.getTime() + rand(1, 20) * 60000)
        : null,
    });
  }

  await prisma.alert.createMany({
    data: alerts,
  });

  console.log("✅ Seed completed");
  console.log("Alerts:", alerts.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());