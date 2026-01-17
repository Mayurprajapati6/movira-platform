/*
  Warnings:

  - The values [DRAFT] on the enum `FacilityApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Facility` table. All the data in the column will be lost.
  - Added the required column `addressLine` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `FacilityImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FacilityLifecycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING_REVIEW', 'SUSPENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "FacilityApprovalStatus_new" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Facility" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "Facility" ALTER COLUMN "approvalStatus" TYPE "FacilityApprovalStatus_new" USING ("approvalStatus"::text::"FacilityApprovalStatus_new");
ALTER TYPE "FacilityApprovalStatus" RENAME TO "FacilityApprovalStatus_old";
ALTER TYPE "FacilityApprovalStatus_new" RENAME TO "FacilityApprovalStatus";
DROP TYPE "public"."FacilityApprovalStatus_old";
ALTER TABLE "Facility" ALTER COLUMN "approvalStatus" SET DEFAULT 'NOT_SUBMITTED';
COMMIT;

-- DropIndex
DROP INDEX "Facility_status_idx";

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "address",
DROP COLUMN "status",
ADD COLUMN     "addressLine" TEXT NOT NULL,
ADD COLUMN     "isSubscriptionActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lifecycleStatus" "FacilityLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pincode" TEXT NOT NULL,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ALTER COLUMN "approvalStatus" SET DEFAULT 'NOT_SUBMITTED';

-- AlterTable
ALTER TABLE "FacilityImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER;

-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "FacilityStatus";

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FacilityCategory" NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAmenity" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "FacilityAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_category_key" ON "Amenity"("name", "category");

-- CreateIndex
CREATE INDEX "FacilityAmenity_facilityId_idx" ON "FacilityAmenity"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAmenity_facilityId_amenityId_key" ON "FacilityAmenity"("facilityId", "amenityId");

-- CreateIndex
CREATE INDEX "Facility_lifecycleStatus_idx" ON "Facility"("lifecycleStatus");

-- CreateIndex
CREATE INDEX "SlotTemplate_facilityId_idx" ON "SlotTemplate"("facilityId");

-- AddForeignKey
ALTER TABLE "FacilityAmenity" ADD CONSTRAINT "FacilityAmenity_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAmenity" ADD CONSTRAINT "FacilityAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
