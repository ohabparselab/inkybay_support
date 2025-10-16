-- CreateTable
CREATE TABLE `marketing_funnels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `installPhase` VARCHAR(191) NOT NULL,
    `typeOfProducts` VARCHAR(191) NOT NULL,
    `otherAppsInstalled` VARCHAR(191) NULL,
    `customizationType` VARCHAR(191) NULL,
    `initialFeedback` VARCHAR(191) NULL,
    `clientSuccessStatus` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow_ups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marketingFunnelId` INTEGER NOT NULL,
    `followUpDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `marketing_funnels` ADD CONSTRAINT `marketing_funnels_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_ups` ADD CONSTRAINT `follow_ups_marketingFunnelId_fkey` FOREIGN KEY (`marketingFunnelId`) REFERENCES `marketing_funnels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
