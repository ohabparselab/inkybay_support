/*
  Warnings:

  - You are about to drop the column `accessToken` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `installedAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `planName` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `uninstalledAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `clients` table. All the data in the column will be lost.
  - Made the column `email` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `clients` DROP COLUMN `accessToken`,
    DROP COLUMN `country`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `currency`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `installedAt`,
    DROP COLUMN `isDeleted`,
    DROP COLUMN `planName`,
    DROP COLUMN `status`,
    DROP COLUMN `timezone`,
    DROP COLUMN `uninstalledAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `shopName` VARCHAR(191) NULL;
