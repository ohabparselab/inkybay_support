-- AlterTable
ALTER TABLE `meetings` ADD COLUMN `projectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
