/*
  Warnings:

  - You are about to drop the `follow_ups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `follow_ups` DROP FOREIGN KEY `follow_ups_marketingFunnelId_fkey`;

-- AlterTable
ALTER TABLE `marketing_funnels` ADD COLUMN `followUpDate` DATETIME(3) NULL,
    ADD COLUMN `followUpStep` VARCHAR(191) NULL,
    MODIFY `installPhase` VARCHAR(191) NULL,
    MODIFY `typeOfProducts` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `follow_ups`;
