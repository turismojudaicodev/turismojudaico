/*
  Warnings:

  - You are about to drop the column `active` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `blog` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `blog` table. All the data in the column will be lost.
  - Added the required column `index` to the `FeaturedTour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `ImageSlide` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Blog_title_key` ON `blog`;

-- AlterTable
ALTER TABLE `blog` DROP COLUMN `active`,
    DROP COLUMN `content`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `image`,
    DROP COLUMN `locale`,
    DROP COLUMN `title`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `featuredtour` ADD COLUMN `index` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `imageslide` ADD COLUMN `index` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `BlogEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `locale` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `blogId` INTEGER NOT NULL,

    UNIQUE INDEX `BlogEntry_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
