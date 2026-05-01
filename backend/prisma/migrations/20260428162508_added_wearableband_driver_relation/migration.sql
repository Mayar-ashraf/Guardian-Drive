/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `WearableBand` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WearableBand" ADD COLUMN     "driverId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "WearableBand_driverId_key" ON "WearableBand"("driverId");

-- AddForeignKey
ALTER TABLE "WearableBand" ADD CONSTRAINT "WearableBand_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
