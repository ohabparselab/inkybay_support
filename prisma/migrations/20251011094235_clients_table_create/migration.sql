-- CreateTable
CREATE TABLE `clients` (
    `id` VARCHAR(191) NOT NULL,
    `shopDomain` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `shopName` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `planName` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `installedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uninstalledAt` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'UNINSTALLED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `clients_shopDomain_key`(`shopDomain`),
    INDEX `clients_shopDomain_email_idx`(`shopDomain`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
