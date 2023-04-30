/*
  Warnings:

  - Added the required column `locale` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `englishName` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `englishName` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `englishName` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locale` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `englishName` to the `SubCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locale` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `City_countryId_fkey` ON `city`;

-- DropIndex
DROP INDEX `Post_categoryId_fkey` ON `post`;

-- DropIndex
DROP INDEX `Post_cityId_fkey` ON `post`;

-- DropIndex
DROP INDEX `Post_countryId_fkey` ON `post`;

-- DropIndex
DROP INDEX `Post_subCategoryId_fkey` ON `post`;

-- DropIndex
DROP INDEX `Post_tourId_fkey` ON `post`;

-- DropIndex
DROP INDEX `SubCategory_categoryId_fkey` ON `subcategory`;

-- AlterTable
ALTER TABLE `blog` ADD COLUMN `locale` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `englishName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `city` ADD COLUMN `englishName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `country` ADD COLUMN `englishName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `post` ADD COLUMN `locale` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `subcategory` ADD COLUMN `englishName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tour` ADD COLUMN `locale` VARCHAR(191) NOT NULL;
