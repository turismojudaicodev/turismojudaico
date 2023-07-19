/*
  Warnings:

  - You are about to drop the column `active` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tour` table. All the data in the column will be lost.
  - You are about to drop the `featuredtour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Post_title_key` ON `post`;

-- DropIndex
DROP INDEX `Tour_title_key` ON `tour`;

-- AlterTable
ALTER TABLE `post` DROP COLUMN `active`,
    DROP COLUMN `content`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `image`,
    DROP COLUMN `locale`,
    DROP COLUMN `title`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `tour` DROP COLUMN `active`,
    DROP COLUMN `content`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `image`,
    DROP COLUMN `locale`,
    DROP COLUMN `title`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `featuredtour`;

-- CreateTable
CREATE TABLE `Image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `locale` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `postId` INTEGER NULL,

    UNIQUE INDEX `PostEntry_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `locale` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TourEntry_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
