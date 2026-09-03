-- Paso A: expansión no destructiva del esquema multitenant.
-- Los tenantId de tablas existentes permanecen opcionales y sus unicidades globales no se modifican.
-- Solo los tres puentes nuevos nacen con tenantId obligatorio porque todavía no contienen datos.

-- AlterTable
ALTER TABLE `Banner` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoardDeliveryOption` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoardFinConfigOption` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoardFinOption` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoardMaterialOption` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoardTailOption` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoardTypeOption` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Carousel` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CarouselSlide` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Color` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ContactProvider` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CustomBoard` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CustomPageItems` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CustomPageSections` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CustomPages` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Garment` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `GarmentImage` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `GarmentVariant` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Grid` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Homegrid` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Movement` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PageConfig` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Provider` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Size` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SizeType` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SubCategory` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `account` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Tenant` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `dominio` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'SUSPENDIDO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tenant_slug_key`(`slug`),
    UNIQUE INDEX `Tenant_dominio_key`(`dominio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoardTypeTailOption` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `boardTypeId` VARCHAR(191) NOT NULL,
    `tailId` VARCHAR(191) NOT NULL,

    INDEX `BoardTypeTailOption_tenantId_boardTypeId_idx`(`tenantId`, `boardTypeId`),
    INDEX `BoardTypeTailOption_tenantId_tailId_idx`(`tenantId`, `tailId`),
    UNIQUE INDEX `BoardTypeTailOption_tenantId_boardTypeId_tailId_key`(`tenantId`, `boardTypeId`, `tailId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoardTypeFinOption` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `boardTypeId` VARCHAR(191) NOT NULL,
    `finId` VARCHAR(191) NOT NULL,

    INDEX `BoardTypeFinOption_tenantId_boardTypeId_idx`(`tenantId`, `boardTypeId`),
    INDEX `BoardTypeFinOption_tenantId_finId_idx`(`tenantId`, `finId`),
    UNIQUE INDEX `BoardTypeFinOption_tenantId_boardTypeId_finId_key`(`tenantId`, `boardTypeId`, `finId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoardTypeFinConfigOption` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `boardTypeId` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,

    INDEX `BoardTypeFinConfigOption_tenantId_boardTypeId_idx`(`tenantId`, `boardTypeId`),
    INDEX `BoardTypeFinConfigOption_tenantId_configId_idx`(`tenantId`, `configId`),
    UNIQUE INDEX `BoardTypeFinConfigOption_tenantId_boardTypeId_configId_key`(`tenantId`, `boardTypeId`, `configId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Banner_tenantId_pageConfigId_idx` ON `Banner`(`tenantId`, `pageConfigId`);

-- CreateIndex
CREATE INDEX `BoardDeliveryOption_tenantId_active_idx` ON `BoardDeliveryOption`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `BoardFinConfigOption_tenantId_active_idx` ON `BoardFinConfigOption`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `BoardFinOption_tenantId_active_idx` ON `BoardFinOption`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `BoardMaterialOption_tenantId_active_idx` ON `BoardMaterialOption`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `BoardTailOption_tenantId_active_idx` ON `BoardTailOption`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `BoardTypeOption_tenantId_active_idx` ON `BoardTypeOption`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `Carousel_tenantId_pageConfigId_idx` ON `Carousel`(`tenantId`, `pageConfigId`);

-- CreateIndex
CREATE INDEX `Carousel_tenantId_active_idx` ON `Carousel`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `CarouselSlide_tenantId_carouselId_idx` ON `CarouselSlide`(`tenantId`, `carouselId`);

-- CreateIndex
CREATE INDEX `Category_tenantId_active_idx` ON `Category`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `Color_tenantId_active_idx` ON `Color`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `ContactProvider_tenantId_idProvider_idx` ON `ContactProvider`(`tenantId`, `idProvider`);

-- CreateIndex
CREATE INDEX `ContactProvider_tenantId_active_idx` ON `ContactProvider`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `CustomBoard_tenantId_idx` ON `CustomBoard`(`tenantId`);

-- CreateIndex
CREATE INDEX `CustomPages_tenantId_isActive_idx` ON `CustomPages`(`tenantId`, `isActive`);

-- CreateIndex
CREATE INDEX `CustomPageItems_tenantId_sectionId_idx` ON `CustomPageItems`(`tenantId`, `sectionId`);

-- CreateIndex
CREATE INDEX `CustomPageSections_tenantId_pageId_idx` ON `CustomPageSections`(`tenantId`, `pageId`);

-- CreateIndex
CREATE INDEX `Garment_tenantId_active_idx` ON `Garment`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `Garment_tenantId_categoryId_idx` ON `Garment`(`tenantId`, `categoryId`);

-- CreateIndex
CREATE INDEX `Garment_tenantId_subCategoryId_idx` ON `Garment`(`tenantId`, `subCategoryId`);

-- CreateIndex
CREATE INDEX `Garment_tenantId_createdAt_idx` ON `Garment`(`tenantId`, `createdAt`);

-- CreateIndex
CREATE INDEX `GarmentImage_tenantId_garmentId_idx` ON `GarmentImage`(`tenantId`, `garmentId`);

-- CreateIndex
CREATE INDEX `GarmentVariant_tenantId_garmentId_idx` ON `GarmentVariant`(`tenantId`, `garmentId`);

-- CreateIndex
CREATE INDEX `Grid_tenantId_homegridId_idx` ON `Grid`(`tenantId`, `homegridId`);

-- CreateIndex
CREATE INDEX `Homegrid_tenantId_active_idx` ON `Homegrid`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `Movement_tenantId_variantId_idx` ON `Movement`(`tenantId`, `variantId`);

-- CreateIndex
CREATE INDEX `Movement_tenantId_createdAt_idx` ON `Movement`(`tenantId`, `createdAt`);

-- CreateIndex
CREATE INDEX `PageConfig_tenantId_idx` ON `PageConfig`(`tenantId`);

-- CreateIndex
CREATE INDEX `Provider_tenantId_active_idx` ON `Provider`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `Size_tenantId_active_idx` ON `Size`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `Size_tenantId_sizeTypeId_idx` ON `Size`(`tenantId`, `sizeTypeId`);

-- CreateIndex
CREATE INDEX `SizeType_tenantId_active_idx` ON `SizeType`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `SubCategory_tenantId_active_idx` ON `SubCategory`(`tenantId`, `active`);

-- CreateIndex
CREATE INDEX `SubCategory_tenantId_categoryId_idx` ON `SubCategory`(`tenantId`, `categoryId`);

-- CreateIndex
CREATE INDEX `account_tenantId_userId_idx` ON `account`(`tenantId`, `userId`);

-- CreateIndex
CREATE INDEX `user_tenantId_role_idx` ON `user`(`tenantId`, `role`);
