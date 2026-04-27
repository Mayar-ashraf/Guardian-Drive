/*
  Warnings:

  - The primary key for the `Car` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[engineId]` on the table `Car` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Car" DROP CONSTRAINT "Car_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Car_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Car_engineId_key" ON "Car"("engineId");
