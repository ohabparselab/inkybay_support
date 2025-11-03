-- AlterTable
ALTER TABLE `marketing_funnels` ADD COLUMN `currentPhase` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `clientSuccessStatus` VARCHAR(191) NULL;
