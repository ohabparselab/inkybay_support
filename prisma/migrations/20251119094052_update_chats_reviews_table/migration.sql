/*
  Warnings:

  - You are about to drop the column `agentRating` on the `reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chats` ADD COLUMN `agentRating` INTEGER NULL;

-- AlterTable
ALTER TABLE `reviews` DROP COLUMN `agentRating`,
    ADD COLUMN `rating` INTEGER NULL;
