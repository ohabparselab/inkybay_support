/*
  Warnings:

  - You are about to drop the column `reviewAsked` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `reviewDate` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `reviewGiven` on the `meetings` table. All the data in the column will be lost.
  - You are about to drop the column `reviewsInfo` on the `meetings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[meetingId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `meetings` DROP COLUMN `reviewAsked`,
    DROP COLUMN `reviewDate`,
    DROP COLUMN `reviewGiven`,
    DROP COLUMN `reviewsInfo`;

-- AlterTable
ALTER TABLE `reviews` ADD COLUMN `reviewDate` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `reviews_meetingId_key` ON `reviews`(`meetingId`);
