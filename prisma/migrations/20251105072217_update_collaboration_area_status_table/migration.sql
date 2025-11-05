/*
  Warnings:

  - You are about to drop the `CollaborationAreaOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollaborationStatuses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CollaborationApp` DROP FOREIGN KEY `CollaborationApp_statusId_fkey`;

-- DropForeignKey
ALTER TABLE `CollaborationAppArea` DROP FOREIGN KEY `CollaborationAppArea_areaOptionId_fkey`;

-- DropIndex
DROP INDEX `CollaborationApp_statusId_fkey` ON `CollaborationApp`;

-- DropIndex
DROP INDEX `CollaborationAppArea_areaOptionId_fkey` ON `CollaborationAppArea`;

-- DropTable
DROP TABLE `CollaborationAreaOption`;

-- DropTable
DROP TABLE `CollaborationStatuses`;

-- CreateTable
CREATE TABLE `CollaborationArea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CollaborationArea_name_key`(`name`),
    UNIQUE INDEX `CollaborationArea_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollaborationStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CollaborationStatus_name_key`(`name`),
    UNIQUE INDEX `CollaborationStatus_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CollaborationApp` ADD CONSTRAINT `CollaborationApp_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `CollaborationStatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationAppArea` ADD CONSTRAINT `CollaborationAppArea_areaOptionId_fkey` FOREIGN KEY (`areaOptionId`) REFERENCES `CollaborationArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
