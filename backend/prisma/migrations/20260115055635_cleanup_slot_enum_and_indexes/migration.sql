/*
  Warnings:

  - The values [FULL_DAY] on the enum `SlotType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SlotType_new" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');
ALTER TABLE "SlotTemplate" ALTER COLUMN "slotType" TYPE "SlotType_new" USING ("slotType"::text::"SlotType_new");
ALTER TABLE "FacilitySlot" ALTER COLUMN "slotType" TYPE "SlotType_new" USING ("slotType"::text::"SlotType_new");
ALTER TABLE "Holiday" ALTER COLUMN "slotType" TYPE "SlotType_new" USING ("slotType"::text::"SlotType_new");
ALTER TABLE "Pass" ALTER COLUMN "allowedSlots" TYPE "SlotType_new"[] USING ("allowedSlots"::text::"SlotType_new"[]);
ALTER TABLE "Booking" ALTER COLUMN "allowedSlots" TYPE "SlotType_new"[] USING ("allowedSlots"::text::"SlotType_new"[]);
ALTER TABLE "Attendance" ALTER COLUMN "slotType" TYPE "SlotType_new" USING ("slotType"::text::"SlotType_new");
ALTER TYPE "SlotType" RENAME TO "SlotType_old";
ALTER TYPE "SlotType_new" RENAME TO "SlotType";
DROP TYPE "public"."SlotType_old";
COMMIT;

-- CreateIndex
CREATE INDEX "FacilityImage_facilityId_idx" ON "FacilityImage"("facilityId");

-- CreateIndex
CREATE INDEX "FacilitySlot_facilityId_date_slotType_idx" ON "FacilitySlot"("facilityId", "date", "slotType");

-- CreateIndex
CREATE INDEX "Holiday_facilityId_date_idx" ON "Holiday"("facilityId", "date");

-- CreateIndex
CREATE INDEX "Holiday_facilityId_date_slotType_idx" ON "Holiday"("facilityId", "date", "slotType");

-- CreateIndex
CREATE INDEX "LedgerEntry_type_idx" ON "LedgerEntry"("type");

-- CreateIndex
CREATE INDEX "Pass_facilityId_idx" ON "Pass"("facilityId");

-- CreateIndex
CREATE INDEX "Pass_status_idx" ON "Pass"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
