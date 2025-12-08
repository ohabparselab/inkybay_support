-- AlterTable
ALTER TABLE `marketing_funnels` ADD COLUMN `projectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `marketing_funnels` ADD CONSTRAINT `marketing_funnels_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
