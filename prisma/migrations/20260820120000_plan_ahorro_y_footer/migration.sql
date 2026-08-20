-- AlterTable
ALTER TABLE `PageConfig` ADD COLUMN `planAhorroEnabled` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PageConfig` ADD COLUMN `footerAboutText` TEXT NULL;
ALTER TABLE `PageConfig` ADD COLUMN `footerCopyrightText` VARCHAR(191) NULL;
ALTER TABLE `PageConfig` ADD COLUMN `footerShowSobre` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `PageConfig` ADD COLUMN `footerShowNavegacion` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `PageConfig` ADD COLUMN `footerShowContacto` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `PageConfig` ADD COLUMN `footerShowUbicacion` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `PageConfig` ADD COLUMN `footerShowRedes` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `PageConfig` ADD COLUMN `footerShowLegales` BOOLEAN NOT NULL DEFAULT true;
