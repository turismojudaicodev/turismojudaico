/*
  Warnings:

  - Added the required column `publicId` to the `StaticImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staticimage` ADD COLUMN `publicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tourentry` ADD COLUMN `tourId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `TourEntry_tourId_idx` ON `TourEntry`(`tourId`);
