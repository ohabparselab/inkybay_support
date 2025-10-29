/*
  Warnings:

  - You are about to drop the column `agentRating` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `featureRequest` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `lastReviewApproach` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `reviewAsked` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `reviewStatus` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `reviewText` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_handleBy_fkey`;

-- DropIndex
DROP INDEX `chats_clientId_fkey` ON `chats`;

-- DropIndex
DROP INDEX `chats_handleBy_fkey` ON `chats`;

-- AlterTable
ALTER TABLE `chats` DROP COLUMN `agentRating`,
    DROP COLUMN `featureRequest`,
    DROP COLUMN `lastReviewApproach`,
    DROP COLUMN `reviewAsked`,
    DROP COLUMN `reviewStatus`,
    DROP COLUMN `reviewText`,
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `externalChat` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `projectId` INTEGER NULL,
    ADD COLUMN `shopEmail` TEXT NULL,
    ADD COLUMN `shopName` TEXT NULL,
    ADD COLUMN `shopUrl` TEXT NULL,
    ADD COLUMN `storefrontPassword` TEXT NULL,
    MODIFY `clientId` INTEGER NULL,
    MODIFY `handleBy` INTEGER NULL;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chatId` INTEGER NULL,
    `meetingId` INTEGER NULL,
    `reviewAsked` BOOLEAN NULL DEFAULT false,
    `reviewStatus` BOOLEAN NULL DEFAULT false,
    `reviewText` TEXT NULL,
    `reviewNotAskReason` TEXT NULL,
    `agentRating` INTEGER NULL,
    `ratingMood` VARCHAR(191) NULL,
    `lastReviewApproach` DATETIME(3) NULL,
    `reviewApproachBy` INTEGER NULL,
    `reviewSubmittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_chatId_key`(`chatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NULL,
    `chatId` INTEGER NULL,
    `featureDetails` TEXT NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_handleBy_fkey` FOREIGN KEY (`handleBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewApproachBy_fkey` FOREIGN KEY (`reviewApproachBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
