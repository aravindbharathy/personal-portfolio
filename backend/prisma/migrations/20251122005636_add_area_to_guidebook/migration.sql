/*
  Warnings:

  - Added the required column `area` to the `Guidebook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Guidebook" ADD COLUMN     "area" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Guidebook_area_idx" ON "Guidebook"("area");
