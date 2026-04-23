/*
  Warnings:

  - Added the required column `fleetManagerId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "fleetManagerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_fleetManagerId_fkey" FOREIGN KEY ("fleetManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
