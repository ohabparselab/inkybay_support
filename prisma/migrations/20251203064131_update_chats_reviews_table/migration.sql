/*
  Warnings:

  - You are about to drop the column `handleBy` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_handleBy_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_reviewApproachBy_fkey`;

-- DropIndex
DROP INDEX `chats_handleBy_fkey` ON `chats`;

-- DropIndex
DROP INDEX `reviews_reviewApproachBy_fkey` ON `reviews`;

-- AlterTable
ALTER TABLE `chats` DROP COLUMN `handleBy`;

-- CreateTable
CREATE TABLE `_ChatHandledByUsers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ChatHandledByUsers_AB_unique`(`A`, `B`),
    INDEX `_ChatHandledByUsers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_reviewApproachByUsers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_reviewApproachByUsers_AB_unique`(`A`, `B`),
    INDEX `_reviewApproachByUsers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ChatHandledByUsers` ADD CONSTRAINT `_ChatHandledByUsers_A_fkey` FOREIGN KEY (`A`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatHandledByUsers` ADD CONSTRAINT `_ChatHandledByUsers_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_reviewApproachByUsers` ADD CONSTRAINT `_reviewApproachByUsers_A_fkey` FOREIGN KEY (`A`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_reviewApproachByUsers` ADD CONSTRAINT `_reviewApproachByUsers_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
