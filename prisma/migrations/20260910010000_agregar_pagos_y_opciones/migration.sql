-- DropIndex
DROP INDEX `GarmentVariant_garmentId_sizeId_colorId_key` ON `GarmentVariant`;

-- AlterTable
ALTER TABLE `Garment` ADD COLUMN `controlaStock` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `etiquetas` JSON NULL;

-- AlterTable
ALTER TABLE `GarmentVariant` ADD COLUMN `priceOverride` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `Homegrid` ADD COLUMN `featuredLayout` ENUM('GRID', 'COLLAGE', 'MINIMAL') NOT NULL DEFAULT 'GRID';

-- CreateTable
CREATE TABLE `GarmentOption` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `garmentId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `GarmentOption_garmentId_idx`(`garmentId`),
    INDEX `GarmentOption_tenantId_garmentId_idx`(`tenantId`, `garmentId`),
    UNIQUE INDEX `GarmentOption_garmentId_name_key`(`garmentId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarmentOptionValue` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `GarmentOptionValue_optionId_idx`(`optionId`),
    INDEX `GarmentOptionValue_tenantId_optionId_idx`(`tenantId`, `optionId`),
    UNIQUE INDEX `GarmentOptionValue_optionId_value_key`(`optionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarmentVariantOptionValue` (
    `variantId` VARCHAR(191) NOT NULL,
    `optionValueId` VARCHAR(191) NOT NULL,

    INDEX `GarmentVariantOptionValue_optionValueId_idx`(`optionValueId`),
    PRIMARY KEY (`variantId`, `optionValueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuentaMercadoPago` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NOT NULL,
    `refreshToken` TEXT NULL,
    `publicKey` VARCHAR(191) NULL,
    `mpUserId` VARCHAR(191) NULL,
    `scope` TEXT NULL,
    `liveMode` BOOLEAN NOT NULL DEFAULT false,
    `conectado` BOOLEAN NOT NULL DEFAULT true,
    `expiraEn` DATETIME(3) NULL,
    `nombreNegocio` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CuentaMercadoPago_tenantId_key`(`tenantId`),
    INDEX `CuentaMercadoPago_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `estadoPago` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_ACREDITACION') NOT NULL DEFAULT 'PENDIENTE',
    `total` DECIMAL(10, 2) NOT NULL,
    `moneda` VARCHAR(191) NOT NULL DEFAULT 'ARS',
    `nombreCliente` VARCHAR(191) NULL,
    `emailCliente` VARCHAR(191) NULL,
    `mpPreferenceId` VARCHAR(191) NULL,
    `mpPaymentId` VARCHAR(191) NULL,
    `metodoPago` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pedido_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
    INDEX `Pedido_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoItem` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `garmentId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `PedidoItem_pedidoId_idx`(`pedidoId`),
    INDEX `PedidoItem_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetodoPago` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `metodo` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MetodoPago_tenantId_activo_idx`(`tenantId`, `activo`),
    UNIQUE INDEX `MetodoPago_tenantId_metodo_key`(`tenantId`, `metodo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `proveedor` VARCHAR(191) NOT NULL,
    `metodo` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `estado` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_ACREDITACION') NOT NULL DEFAULT 'PENDIENTE',
    `monto` DECIMAL(10, 2) NOT NULL,
    `moneda` VARCHAR(191) NOT NULL DEFAULT 'ARS',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_pedidoId_idx`(`pedidoId`),
    INDEX `Payment_tenantId_idx`(`tenantId`),
    INDEX `Payment_tenantId_proveedor_idx`(`tenantId`, `proveedor`),
    UNIQUE INDEX `Payment_tenantId_proveedor_externalId_key`(`tenantId`, `proveedor`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
