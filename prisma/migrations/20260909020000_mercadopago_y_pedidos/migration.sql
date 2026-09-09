-- Migración: Mercado Pago (conexión por tenant) + Pedidos
-- Solo crea tablas nuevas; no modifica tablas existentes.

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
    `cantidad` INT NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `PedidoItem_pedidoId_idx`(`pedidoId`),
    INDEX `PedidoItem_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CuentaMercadoPago` ADD CONSTRAINT `CuentaMercadoPago_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoItem` ADD CONSTRAINT `PedidoItem_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
