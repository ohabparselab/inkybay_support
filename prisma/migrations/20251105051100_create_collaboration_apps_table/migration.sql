-- CreateTable
CREATE TABLE `CollaborationApp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NULL,
    `appName` VARCHAR(191) NOT NULL,
    `appUrl` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `companyUrl` VARCHAR(191) NULL,
    `appDetails` TEXT NULL,
    `appAddedDate` DATETIME(3) NULL,
    `statusId` INTEGER NULL,
    `completedDate` DATETIME(3) NULL,
    `comments` TEXT NULL,
    `meetingDetails` TEXT NULL,
    `sendById` INTEGER NULL,
    `addedById` INTEGER NULL,
    `requestType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollaborationAppEmail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `appId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollaborationAppArea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appId` INTEGER NOT NULL,
    `areaOptionId` INTEGER NOT NULL,

    UNIQUE INDEX `CollaborationAppArea_appId_areaOptionId_key`(`appId`, `areaOptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollaborationAreaOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CollaborationAreaOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollaborationStatuses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CollaborationStatuses_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CollaborationApp` ADD CONSTRAINT `CollaborationApp_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `CollaborationStatuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationApp` ADD CONSTRAINT `CollaborationApp_sendById_fkey` FOREIGN KEY (`sendById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationApp` ADD CONSTRAINT `CollaborationApp_addedById_fkey` FOREIGN KEY (`addedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationApp` ADD CONSTRAINT `CollaborationApp_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationAppEmail` ADD CONSTRAINT `CollaborationAppEmail_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `CollaborationApp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationAppArea` ADD CONSTRAINT `CollaborationAppArea_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `CollaborationApp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollaborationAppArea` ADD CONSTRAINT `CollaborationAppArea_areaOptionId_fkey` FOREIGN KEY (`areaOptionId`) REFERENCES `CollaborationAreaOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
