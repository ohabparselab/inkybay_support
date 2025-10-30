/*
  Warnings:

  - A unique constraint covering the columns `[meetingId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `reviews_meetingId_key` ON `reviews`(`meetingId`);
