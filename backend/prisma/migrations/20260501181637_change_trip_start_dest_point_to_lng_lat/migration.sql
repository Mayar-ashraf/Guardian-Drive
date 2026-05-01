/*
  Warnings:

  - You are about to drop the column `destPoint` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `startPoint` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `destLatitude` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destLongitude` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startLatitude` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startLongitude` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "destPoint",
DROP COLUMN "startPoint",
ADD COLUMN     "destLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "destLongitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "startLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "startLongitude" DOUBLE PRECISION NOT NULL;
