-- CreateTable
CREATE TABLE "Vitals" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "heartRate" DOUBLE PRECISION NOT NULL,
    "spo2" DOUBLE PRECISION NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vitals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vitals_driverId_key" ON "Vitals"("driverId");

-- AddForeignKey
ALTER TABLE "Vitals" ADD CONSTRAINT "Vitals_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
