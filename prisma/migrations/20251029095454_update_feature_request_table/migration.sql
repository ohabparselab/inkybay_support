/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `feature_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `feature_requests_chatId_key` ON `feature_requests`(`chatId`);
