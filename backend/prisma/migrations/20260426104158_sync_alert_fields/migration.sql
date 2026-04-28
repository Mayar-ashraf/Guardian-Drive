/*
  Warnings:

  - The values [VEHICLE_EMERGENCY] on the enum `alertType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `locationId` on the `Alert` table. All the data in the column will be lost.
  - Added the required column `triggeredLocationId` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "alertType_new" AS ENUM ('HEALTH_ABNORMAL', 'SOS');
ALTER TABLE "Alert" ALTER COLUMN "type" TYPE "alertType_new" USING ("type"::text::"alertType_new");
ALTER TYPE "alertType" RENAME TO "alertType_old";
ALTER TYPE "alertType_new" RENAME TO "alertType";
DROP TYPE "public"."alertType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_locationId_fkey";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "locationId",
ADD COLUMN     "stoppedLocationId" INTEGER,
ADD COLUMN     "triggeredLocationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_triggeredLocationId_fkey" FOREIGN KEY ("triggeredLocationId") REFERENCES "Location"("locationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_stoppedLocationId_fkey" FOREIGN KEY ("stoppedLocationId") REFERENCES "Location"("locationId") ON DELETE SET NULL ON UPDATE CASCADE;
