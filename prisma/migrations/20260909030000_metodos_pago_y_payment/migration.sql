-- Migración: Métodos de pago configurables + Payment multi-proveedor
-- Solo crea tablas nuevas; no modifica tablas existentes (relationMode = prisma).

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

    UNIQUE INDEX `MetodoPago_tenantId_metodo_key`(`tenantId`, `metodo`),
    INDEX `MetodoPago_tenantId_activo_idx`(`tenantId`, `activo`),
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
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
