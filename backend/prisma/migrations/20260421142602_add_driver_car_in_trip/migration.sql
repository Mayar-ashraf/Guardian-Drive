-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "driverId" INTEGER,
ADD COLUMN     "engineId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Car"("engineId") ON DELETE SET NULL ON UPDATE CASCADE;
