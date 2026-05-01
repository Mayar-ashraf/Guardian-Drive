/*
  Warnings:

  - A unique constraint covering the columns `[alertId]` on the table `TowingRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alertId` to the `TowingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TowingRequest" ADD COLUMN     "alertId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TowingRequest_alertId_key" ON "TowingRequest"("alertId");

-- AddForeignKey
ALTER TABLE "TowingRequest" ADD CONSTRAINT "TowingRequest_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("alertId") ON DELETE CASCADE ON UPDATE CASCADE;
