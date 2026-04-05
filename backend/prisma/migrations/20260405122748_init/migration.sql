-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FLEET_MANAGER', 'DRIVER');

-- CreateEnum
CREATE TYPE "tripStatus" AS ENUM ('PLANNED', 'ONGOING', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "carStatus" AS ENUM ('ACTIVE', 'IN_TRIP', 'DISABLED');

-- CreateEnum
CREATE TYPE "alertStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "alertType" AS ENUM ('HEALTH_ABNORMAL', 'SOS', 'VEHICLE_EMERGENCY');

-- CreateEnum
CREATE TYPE "requestStatus" AS ENUM ('REQUESTED', 'INPROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT[],
    "hiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL,
    "drivingLicense" TEXT NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "tripId" SERIAL NOT NULL,
    "startPoint" TEXT NOT NULL,
    "destPoint" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "tripStatus" NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("tripId")
);

-- CreateTable
CREATE TABLE "Location" (
    "locationId" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("locationId")
);

-- CreateTable
CREATE TABLE "Car" (
    "engineId" TEXT NOT NULL,
    "plateNo" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "status" "carStatus" NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("engineId")
);

-- CreateTable
CREATE TABLE "HardwareAddOn" (
    "moduleId" SERIAL NOT NULL,
    "buzzerStatus" BOOLEAN NOT NULL,
    "hazardLightStatus" BOOLEAN NOT NULL,
    "speedControllStatus" BOOLEAN NOT NULL,
    "engineStatus" BOOLEAN NOT NULL,

    CONSTRAINT "HardwareAddOn_pkey" PRIMARY KEY ("moduleId")
);

-- CreateTable
CREATE TABLE "Alert" (
    "alertId" SERIAL NOT NULL,
    "type" "alertType" NOT NULL,
    "status" "alertStatus" NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solvedAt" TIMESTAMP(3),
    "tripId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("alertId")
);

-- CreateTable
CREATE TABLE "WearableBand" (
    "deviceId" SERIAL NOT NULL,
    "sensorList" TEXT[],
    "batteryLevel" INTEGER NOT NULL,
    "isConnected" BOOLEAN NOT NULL,

    CONSTRAINT "WearableBand_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "MedicalInformation" (
    "recordId" SERIAL NOT NULL,
    "conditions" TEXT[],
    "medications" TEXT[],
    "driverId" INTEGER NOT NULL,

    CONSTRAINT "MedicalInformation_pkey" PRIMARY KEY ("recordId")
);

-- CreateTable
CREATE TABLE "AvgHealthReadings" (
    "heartRateRange" TEXT NOT NULL,
    "tempRange" TEXT NOT NULL,
    "driverId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "HealthEvent" (
    "eventId" SERIAL NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heartRate" TEXT NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,
    "recordId" INTEGER NOT NULL,
    "alertId" INTEGER NOT NULL,

    CONSTRAINT "HealthEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "TowingRequest" (
    "requestId" SERIAL NOT NULL,
    "status" "requestStatus" NOT NULL,
    "requestTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionTime" TIMESTAMP(3),
    "towingCompany" TEXT NOT NULL,
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "TowingRequest_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "EmergencyServiceRequest" (
    "requestId" SERIAL NOT NULL,
    "status" "requestStatus" NOT NULL,
    "requestTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT NOT NULL,
    "completionTime" TIMESTAMP(3),
    "hospitalAssigned" TEXT NOT NULL,
    "alertId" INTEGER NOT NULL,

    CONSTRAINT "EmergencyServiceRequest_pkey" PRIMARY KEY ("requestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalInformation_driverId_key" ON "MedicalInformation"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "AvgHealthReadings_driverId_key" ON "AvgHealthReadings"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthEvent_alertId_key" ON "HealthEvent"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "TowingRequest_tripId_key" ON "TowingRequest"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyServiceRequest_alertId_key" ON "EmergencyServiceRequest"("alertId");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("locationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalInformation" ADD CONSTRAINT "MedicalInformation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvgHealthReadings" ADD CONSTRAINT "AvgHealthReadings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "MedicalInformation"("recordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("alertId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TowingRequest" ADD CONSTRAINT "TowingRequest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyServiceRequest" ADD CONSTRAINT "EmergencyServiceRequest_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("alertId") ON DELETE CASCADE ON UPDATE CASCADE;
