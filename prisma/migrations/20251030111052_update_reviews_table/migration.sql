-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
