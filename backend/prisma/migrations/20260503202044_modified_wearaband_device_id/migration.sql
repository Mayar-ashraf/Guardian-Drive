-- AlterTable
ALTER TABLE "WearableBand" ALTER COLUMN "deviceId" DROP DEFAULT;
DROP SEQUENCE "WearableBand_deviceId_seq";
