-- AlterTable
ALTER TABLE "User" ADD COLUMN     "configCompletedAt" TIMESTAMP(3),
ADD COLUMN     "priorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rotationPlan" JSONB;

-- CreateTable
CREATE TABLE "Rotation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parcel" TEXT NOT NULL,
    "previousCrop" TEXT NOT NULL,
    "currentCrop" TEXT NOT NULL,
    "nextCrop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rotation_userId_idx" ON "Rotation"("userId");

-- CreateIndex
CREATE INDEX "Rotation_userId_parcel_idx" ON "Rotation"("userId", "parcel");

-- AddForeignKey
ALTER TABLE "Rotation" ADD CONSTRAINT "Rotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
