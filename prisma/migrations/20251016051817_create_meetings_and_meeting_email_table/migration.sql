-- CreateTable
CREATE TABLE `meetings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agentId` INTEGER NOT NULL,
    `storeUrl` VARCHAR(191) NOT NULL,
    `isExternalMeeting` BOOLEAN NULL DEFAULT false,
    `meetingDetails` VARCHAR(191) NULL,
    `meetingDateTime` DATETIME(3) NOT NULL,
    `reviewAsked` BOOLEAN NULL DEFAULT false,
    `reviewGiven` BOOLEAN NULL DEFAULT false,
    `reviewDate` DATETIME(3) NULL,
    `reviewsInfo` VARCHAR(191) NULL,
    `joiningStatus` BOOLEAN NULL DEFAULT false,
    `recordedVideo` VARCHAR(191) NULL,
    `meetingNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_emails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `meetingId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `meeting_emails_meetingId_email_key`(`meetingId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_emails` ADD CONSTRAINT `meeting_emails_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
