-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_meetingId_fkey`;

-- DropIndex
DROP INDEX `reviews_meetingId_key` ON `reviews`;
