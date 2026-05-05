/*
  Warnings:

  - You are about to drop the column `heartRateRange` on the `AvgHealthReadings` table. All the data in the column will be lost.
  - You are about to drop the column `tempRange` on the `AvgHealthReadings` table. All the data in the column will be lost.
  - You are about to drop the column `firstAidGuidance` on the `HealthEvent` table. All the data in the column will be lost.
  - Added the required column `avgHeartRate` to the `AvgHealthReadings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avgSpo2` to the `AvgHealthReadings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avgTemp` to the `AvgHealthReadings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripId` to the `AvgHealthReadings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spo2` to the `HealthEvent` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `heartRate` on the `HealthEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `avgHeartRate` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avgSpo2` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avgTemp` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxHeartRate` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxSpo2` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxTemp` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minHeartRate` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minSpo2` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minTemp` to the `MedicalInformation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('LOW_SPO2', 'HIGH_HEART_RATE', 'LOW_HEART_RATE', 'HIGH_TEMP', 'LOW_TEMP');

-- CreateEnum
CREATE TYPE "ConditionSeverity" AS ENUM ('MILD', 'MODERATE', 'CRITICAL');

-- DropIndex
DROP INDEX "AvgHealthReadings_driverId_key";

-- AlterTable
ALTER TABLE "AvgHealthReadings" DROP COLUMN "heartRateRange",
DROP COLUMN "tempRange",
ADD COLUMN     "avgHeartRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "avgSpo2" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "avgTemp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tripId" INTEGER NOT NULL,
ADD CONSTRAINT "AvgHealthReadings_pkey" PRIMARY KEY ("tripId");

-- AlterTable
ALTER TABLE "HealthEvent" DROP COLUMN "firstAidGuidance",
ADD COLUMN     "spo2" DOUBLE PRECISION NOT NULL,
DROP COLUMN "heartRate",
ADD COLUMN     "heartRate" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "MedicalInformation" ADD COLUMN     "avgHeartRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "avgSpo2" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "avgTemp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxHeartRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxSpo2" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxTemp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minHeartRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minSpo2" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minTemp" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "FirstAidGuidance" (
    "guidanceId" SERIAL NOT NULL,
    "condition" "ConditionType" NOT NULL,
    "severity" "ConditionSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "specificAction" TEXT,

    CONSTRAINT "FirstAidGuidance_pkey" PRIMARY KEY ("guidanceId")
);

-- CreateTable
CREATE TABLE "_FirstAidGuidanceToHealthEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FirstAidGuidanceToHealthEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "FirstAidGuidance_condition_severity_key" ON "FirstAidGuidance"("condition", "severity");

-- CreateIndex
CREATE INDEX "_FirstAidGuidanceToHealthEvent_B_index" ON "_FirstAidGuidanceToHealthEvent"("B");

-- AddForeignKey
ALTER TABLE "AvgHealthReadings" ADD CONSTRAINT "AvgHealthReadings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FirstAidGuidanceToHealthEvent" ADD CONSTRAINT "_FirstAidGuidanceToHealthEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "FirstAidGuidance"("guidanceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FirstAidGuidanceToHealthEvent" ADD CONSTRAINT "_FirstAidGuidanceToHealthEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "HealthEvent"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;
