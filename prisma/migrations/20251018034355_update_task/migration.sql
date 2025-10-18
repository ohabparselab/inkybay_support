/*
  Warnings:

  - You are about to drop the column `taskStatus` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tasks` DROP COLUMN `taskStatus`,
    ADD COLUMN `statusId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `statuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
