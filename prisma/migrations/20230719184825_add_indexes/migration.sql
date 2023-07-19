/*
  Warnings:

  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imageslide` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `image`;

-- DropTable
DROP TABLE `imageslide`;

-- CreateTable
CREATE TABLE `StaticImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `section` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `BlogEntry_blogId_idx` ON `BlogEntry`(`blogId`);

-- CreateIndex
CREATE INDEX `City_countryId_idx` ON `City`(`countryId`);

-- CreateIndex
CREATE INDEX `Post_categoryId_idx` ON `Post`(`categoryId`);

-- CreateIndex
CREATE INDEX `Post_subCategoryId_idx` ON `Post`(`subCategoryId`);

-- CreateIndex
CREATE INDEX `Post_countryId_idx` ON `Post`(`countryId`);

-- CreateIndex
CREATE INDEX `Post_cityId_idx` ON `Post`(`cityId`);

-- CreateIndex
CREATE INDEX `Post_tourId_idx` ON `Post`(`tourId`);

-- CreateIndex
CREATE INDEX `PostEntry_postId_idx` ON `PostEntry`(`postId`);

-- CreateIndex
CREATE INDEX `SubCategory_categoryId_idx` ON `SubCategory`(`categoryId`);

-- CreateIndex
CREATE INDEX `Tour_countryId_idx` ON `Tour`(`countryId`);
