-- AlterTable
ALTER TABLE `feature_requests` ADD COLUMN `projectId` INTEGER NULL;

-- AlterTable
ALTER TABLE `reviews` ADD COLUMN `projectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
