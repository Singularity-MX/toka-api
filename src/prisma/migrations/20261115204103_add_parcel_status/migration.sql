-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('ACTIVE', 'FALLOW', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "status" "ParcelStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Parcel_userId_status_idx" ON "Parcel"("userId", "status");
