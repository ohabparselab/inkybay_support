-- AlterTable
ALTER TABLE `chats` ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `feature_requests` ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `reviews` ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
