-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "approvalReason" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedData" JSONB;

-- AlterTable
ALTER TABLE "FacilityAmenity" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FacilityImage" ADD COLUMN     "mediumUrl" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "FacilityHistory" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilityHistory_facilityId_idx" ON "FacilityHistory"("facilityId");

-- CreateIndex
CREATE INDEX "FacilityHistory_createdAt_idx" ON "FacilityHistory"("createdAt");

-- CreateIndex
CREATE INDEX "FacilityHistory_changeType_idx" ON "FacilityHistory"("changeType");

-- CreateIndex
CREATE INDEX "Facility_category_idx" ON "Facility"("category");

-- CreateIndex
CREATE INDEX "Facility_isPublished_idx" ON "Facility"("isPublished");

-- CreateIndex
CREATE INDEX "FacilityAmenity_amenityId_idx" ON "FacilityAmenity"("amenityId");

-- CreateIndex
CREATE INDEX "FacilityImage_isPrimary_idx" ON "FacilityImage"("isPrimary");

-- AddForeignKey
ALTER TABLE "FacilityHistory" ADD CONSTRAINT "FacilityHistory_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
