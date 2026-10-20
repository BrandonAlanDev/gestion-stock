ALTER TABLE `Pedido`
  MODIFY `estado` ENUM('PENDIENTE','CONFIRMADO','EN_PREPARACION','LISTO','ENVIADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  MODIFY `estadoPago` ENUM('PENDIENTE','APROBADO','RECHAZADO','CANCELADO','EN_ACREDITACION','REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN `estadoEnvio` ENUM('PENDIENTE','PREPARANDO','DESPACHADO','ENTREGADO') NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN `metodoEntrega` ENUM('DOMICILIO','RETIRO_TIENDA','PUNTO_RETIRO') NOT NULL DEFAULT 'DOMICILIO',
  ADD COLUMN `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN `descuento` DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN `costoEnvio` DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN `apellidoCliente` VARCHAR(191) NULL,
  ADD COLUMN `dniCliente` VARCHAR(191) NULL,
  ADD COLUMN `telefonoCliente` VARCHAR(191) NULL;

ALTER TABLE `Pedido` ADD COLUMN `numero` INTEGER NULL;
CREATE UNIQUE INDEX `Pedido_numero_key` ON `Pedido`(`numero`);

CREATE TABLE `NumeroPedido` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

UPDATE `Pedido` SET `subtotal` = `total` WHERE `subtotal` = 0;

ALTER TABLE `PedidoItem`
  ADD COLUMN `varianteNombre` VARCHAR(191) NULL,
  ADD COLUMN `imagen` TEXT NULL;

ALTER TABLE `Payment`
  MODIFY `estado` ENUM('PENDIENTE','APROBADO','RECHAZADO','CANCELADO','EN_ACREDITACION','REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE';

CREATE TABLE `Transportista` (
  `id` VARCHAR(191) NOT NULL,
  `nombre` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `plantillaUrl` TEXT NULL,
  `requiereUrl` BOOLEAN NOT NULL DEFAULT false,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `orden` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Transportista_slug_key`(`slug`),
  INDEX `Transportista_activo_orden_idx`(`activo`, `orden`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PedidoEnvio` (
  `id` VARCHAR(191) NOT NULL,
  `pedidoId` VARCHAR(191) NOT NULL,
  `metodoEntrega` ENUM('DOMICILIO','RETIRO_TIENDA','PUNTO_RETIRO') NOT NULL DEFAULT 'DOMICILIO',
  `destinatario` VARCHAR(191) NULL,
  `telefono` VARCHAR(191) NULL,
  `calle` VARCHAR(191) NULL,
  `numero` VARCHAR(191) NULL,
  `piso` VARCHAR(191) NULL,
  `departamento` VARCHAR(191) NULL,
  `codigoPostal` VARCHAR(191) NULL,
  `localidad` VARCHAR(191) NULL,
  `provincia` VARCHAR(191) NULL,
  `pais` VARCHAR(191) NOT NULL DEFAULT 'AR',
  `referencias` TEXT NULL,
  `transportista` VARCHAR(191) NULL,
  `transportistaId` VARCHAR(191) NULL,
  `trackingNumero` VARCHAR(191) NULL,
  `trackingUrl` TEXT NULL,
  `fechaDespacho` DATETIME(3) NULL,
  `fechaEstimada` DATETIME(3) NULL,
  `fechaEntrega` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `PedidoEnvio_pedidoId_key`(`pedidoId`),
  INDEX `PedidoEnvio_transportistaId_idx`(`transportistaId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PedidoEvento` (
  `id` VARCHAR(191) NOT NULL,
  `pedidoId` VARCHAR(191) NOT NULL,
  `tipo` ENUM('CREACION','PAGO_APROBADO','PAGO_RECHAZADO','PAGO_EN_ACREDITACION','CANCELADO','REEMBOLSADO','CAMBIO_ESTADO','CAMBIO_ENVIO','NOTA') NOT NULL,
  `descripcion` VARCHAR(191) NOT NULL,
  `estadoAnterior` VARCHAR(191) NULL,
  `estadoNuevo` VARCHAR(191) NULL,
  `usuarioId` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `PedidoEvento_pedidoId_createdAt_idx`(`pedidoId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DireccionUsuario` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `alias` VARCHAR(191) NULL,
  `destinatario` VARCHAR(191) NULL,
  `telefono` VARCHAR(191) NULL,
  `calle` VARCHAR(191) NOT NULL,
  `numero` VARCHAR(191) NOT NULL,
  `piso` VARCHAR(191) NULL,
  `departamento` VARCHAR(191) NULL,
  `codigoPostal` VARCHAR(191) NOT NULL,
  `localidad` VARCHAR(191) NOT NULL,
  `provincia` VARCHAR(191) NOT NULL,
  `pais` VARCHAR(191) NOT NULL DEFAULT 'AR',
  `referencias` TEXT NULL,
  `esPrincipal` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `DireccionUsuario_userId_esPrincipal_idx`(`userId`, `esPrincipal`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

