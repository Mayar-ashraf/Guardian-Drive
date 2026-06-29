/*
  Warnings:

  - Added the required column `tripId` to the `Vitals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Vitals_driverId_key";

-- AlterTable
ALTER TABLE "Vitals" ADD COLUMN     "tripId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Vitals" ADD CONSTRAINT "Vitals_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("tripId") ON DELETE CASCADE ON UPDATE CASCADE;
