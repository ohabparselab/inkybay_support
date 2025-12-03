/*
  Warnings:

  - You are about to drop the column `agentId` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `reviewApproachBy` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
-- ALTER TABLE `meetings` DROP FOREIGN KEY `meetings_agentId_fkey`;

-- DropIndex
-- DROP INDEX `meetings_agentId_fkey` ON `meetings`;

-- AlterTable
-- ALTER TABLE `meetings` DROP COLUMN `agentId`;

-- AlterTable
-- ALTER TABLE `reviews` DROP COLUMN `reviewApproachBy`;

-- CreateTable
CREATE TABLE `_MeetingAgents` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,
    
    PRIMARY KEY (`A`, `B`),
    UNIQUE INDEX `_MeetingAgents_AB_unique`(`A`, `B`),
    INDEX `_MeetingAgents_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_MeetingAgents` ADD CONSTRAINT `_MeetingAgents_A_fkey` FOREIGN KEY (`A`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MeetingAgents` ADD CONSTRAINT `_MeetingAgents_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
