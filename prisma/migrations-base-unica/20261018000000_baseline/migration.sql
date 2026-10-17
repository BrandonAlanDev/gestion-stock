-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `account_userId_idx`(`userId`),
    UNIQUE INDEX `account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,

    INDEX `user_role_idx`(`role`),
    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Category_active_idx`(`active`),
    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sizeTypeId` VARCHAR(191) NULL,

    INDEX `SubCategory_categoryId_idx`(`categoryId`),
    INDEX `SubCategory_sizeTypeId_idx`(`sizeTypeId`),
    INDEX `SubCategory_active_idx`(`active`),
    UNIQUE INDEX `SubCategory_name_categoryId_key`(`name`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Garment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `categoryId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `cost` DECIMAL(10, 2) NOT NULL,
    `subCategoryId` VARCHAR(191) NULL,
    `maxPrice` DECIMAL(10, 2) NULL,
    `etiquetas` JSON NULL,
    `controlaStock` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Garment_categoryId_idx`(`categoryId`),
    INDEX `Garment_categoryId_createdAt_idx`(`categoryId`, `createdAt`),
    INDEX `Garment_subCategoryId_createdAt_idx`(`subCategoryId`, `createdAt`),
    INDEX `Garment_subCategoryId_idx`(`subCategoryId`),
    INDEX `Garment_supplierId_idx`(`supplierId`),
    INDEX `Garment_active_idx`(`active`),
    INDEX `Garment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarmentImage` (
    `id` VARCHAR(191) NOT NULL,
    `srcImage` TEXT NOT NULL,
    `publicId` TEXT NULL,
    `alt` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `garmentId` VARCHAR(191) NOT NULL,

    INDEX `GarmentImage_garmentId_idx`(`garmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarmentVariant` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `garmentId` VARCHAR(191) NOT NULL,
    `sizeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `colorId` VARCHAR(191) NULL,
    `attributes` JSON NULL,
    `priceOverride` DECIMAL(10, 2) NULL,

    INDEX `GarmentVariant_garmentId_idx`(`garmentId`),
    INDEX `GarmentVariant_sizeId_idx`(`sizeId`),
    INDEX `GarmentVariant_colorId_idx`(`colorId`),
    UNIQUE INDEX `GarmentVariant_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarmentOption` (
    `id` VARCHAR(191) NOT NULL,
    `garmentId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `GarmentOption_garmentId_idx`(`garmentId`),
    UNIQUE INDEX `GarmentOption_garmentId_name_key`(`garmentId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarmentOptionValue` (
    `id` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `GarmentOptionValue_optionId_idx`(`optionId`),
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
CREATE TABLE `SizeType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `SizeType_active_idx`(`active`),
    UNIQUE INDEX `SizeType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Size` (
    `id` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `sizeTypeId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    INDEX `Size_sizeTypeId_idx`(`sizeTypeId`),
    INDEX `Size_active_idx`(`active`),
    UNIQUE INDEX `Size_value_sizeTypeId_key`(`value`, `sizeTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hex` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Color_active_idx`(`active`),
    UNIQUE INDEX `Color_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Provider` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `details` VARCHAR(191) NULL,

    INDEX `Provider_active_idx`(`active`),
    UNIQUE INDEX `Provider_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactProvider` (
    `id` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `idProvider` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContactProvider_idProvider_idx`(`idProvider`),
    INDEX `ContactProvider_active_idx`(`active`),
    UNIQUE INDEX `ContactProvider_contact_idProvider_key`(`contact`, `idProvider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Movement` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('IN', 'OUT') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `priceAtTime` DECIMAL(10, 2) NOT NULL,
    `note` VARCHAR(191) NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Movement_variantId_idx`(`variantId`),
    INDEX `Movement_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `Movement_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(191) NOT NULL DEFAULT 'principal',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `storeName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `slogan` VARCHAR(191) NULL,
    `logo` TEXT NULL,
    `favicon` TEXT NULL,
    `primaryColor` VARCHAR(191) NULL DEFAULT '#06b6d4',
    `secondaryColor` VARCHAR(191) NULL DEFAULT '#FFFFFF',
    `bgColor` VARCHAR(191) NULL DEFAULT '#09090b',
    `ecommerceEnabled` BOOLEAN NOT NULL DEFAULT true,
    `cartEnabled` BOOLEAN NOT NULL DEFAULT true,
    `checkoutEnabled` BOOLEAN NOT NULL DEFAULT true,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `locationEnabled` BOOLEAN NOT NULL DEFAULT false,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `mapsUrl` TEXT NULL,
    `instagram` TEXT NULL,
    `facebook` TEXT NULL,
    `tiktok` TEXT NULL,
    `x` TEXT NULL,
    `youtube` TEXT NULL,
    `linkedin` TEXT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'ARS',
    `language` VARCHAR(191) NOT NULL DEFAULT 'es',
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `termsAndConditions` TEXT NULL,
    `privacyPolicy` TEXT NULL,
    `featuredLayout` ENUM('GRID', 'COLLAGE', 'MINIMAL') NOT NULL DEFAULT 'GRID',
    `homegridId` VARCHAR(191) NULL,
    `footerAboutText` TEXT NULL,
    `footerCopyrightText` VARCHAR(191) NULL,
    `footerShowSobre` BOOLEAN NOT NULL DEFAULT true,
    `footerShowNavegacion` BOOLEAN NOT NULL DEFAULT true,
    `footerShowContacto` BOOLEAN NOT NULL DEFAULT true,
    `footerShowUbicacion` BOOLEAN NOT NULL DEFAULT true,
    `footerShowRedes` BOOLEAN NOT NULL DEFAULT true,
    `footerShowLegales` BOOLEAN NOT NULL DEFAULT true,
    `sectionOrder` VARCHAR(191) NOT NULL DEFAULT '["hero","banner","featured","cards","location"]',
    `fontPrimary` VARCHAR(191) NOT NULL DEFAULT 'Outfit',
    `fontSecondary` VARCHAR(191) NOT NULL DEFAULT 'Playfair Display',
    `borderRadius` VARCHAR(191) NOT NULL DEFAULT 'redondeado',
    `shadowLevel` VARCHAR(191) NOT NULL DEFAULT 'sutil',
    `density` VARCHAR(191) NOT NULL DEFAULT 'comoda',

    UNIQUE INDEX `PageConfig_clave_key`(`clave`),
    INDEX `PageConfig_homegridId_idx`(`homegridId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `order` INTEGER NOT NULL,
    `image` TEXT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `text` TEXT NULL,
    `url` TEXT NULL,
    `pageConfigId` INTEGER NOT NULL,

    INDEX `Banner_pageConfigId_idx`(`pageConfigId`),
    UNIQUE INDEX `Banner_pageConfigId_order_key`(`pageConfigId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomPages` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomPages_isActive_idx`(`isActive`),
    UNIQUE INDEX `CustomPages_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomPageSections` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'TEXT', 'CARDS', 'FAQ', 'TIMELINE', 'CTA', 'GALLERY', 'FEATURES') NOT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `config` JSON NULL,

    INDEX `CustomPageSections_pageId_idx`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomPageItems` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `config` JSON NULL,

    INDEX `CustomPageItems_sectionId_idx`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Homegrid` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `style` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `featuredLayout` ENUM('GRID', 'COLLAGE', 'MINIMAL') NOT NULL DEFAULT 'GRID',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `columns` VARCHAR(191) NOT NULL DEFAULT 'md:grid-cols-2',

    INDEX `Homegrid_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grid` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `homegridId` VARCHAR(191) NOT NULL,
    `linkType` ENUM('NONE', 'CATEGORY', 'PRODUCT', 'PAGE', 'EXTERNAL') NOT NULL DEFAULT 'NONE',
    `linkValue` VARCHAR(191) NULL,
    `subtitleNeon` BOOLEAN NOT NULL DEFAULT false,
    `subtitleDim` BOOLEAN NOT NULL DEFAULT false,
    `linkStyle` ENUM('IMAGE', 'BUTTON') NOT NULL DEFAULT 'IMAGE',
    `buttonVariant` ENUM('DEFAULT', 'STRAIGHT', 'TRANSPARENT') NOT NULL DEFAULT 'DEFAULT',
    `buttonText` VARCHAR(191) NULL,
    `buttonBgColor` VARCHAR(191) NULL,
    `buttonTextColor` VARCHAR(191) NULL,

    INDEX `Grid_homegridId_idx`(`homegridId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Carousel` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'BANNER', 'CARDS') NOT NULL,
    `title` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `pageConfigId` INTEGER NOT NULL,
    `settings` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Carousel_active_idx`(`active`),
    INDEX `Carousel_pageConfigId_idx`(`pageConfigId`),
    UNIQUE INDEX `Carousel_pageConfigId_order_key`(`pageConfigId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CarouselSlide` (
    `id` VARCHAR(191) NOT NULL,
    `carouselId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `image` TEXT NULL,
    `publicId` TEXT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `ctaText` VARCHAR(191) NULL,
    `url` TEXT NULL,
    `config` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CarouselSlide_carouselId_idx`(`carouselId`),
    UNIQUE INDEX `CarouselSlide_carouselId_order_key`(`carouselId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuentaMercadoPago` (
    `id` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL DEFAULT 'principal',
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

    UNIQUE INDEX `CuentaMercadoPago_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `estadoPago` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_ACREDITACION') NOT NULL DEFAULT 'PENDIENTE',
    `stockReservado` BOOLEAN NOT NULL DEFAULT false,
    `reservaExpiraEn` DATETIME(3) NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `moneda` VARCHAR(191) NOT NULL DEFAULT 'ARS',
    `nombreCliente` VARCHAR(191) NULL,
    `emailCliente` VARCHAR(191) NULL,
    `mpPreferenceId` VARCHAR(191) NULL,
    `mpPaymentId` VARCHAR(191) NULL,
    `metodoPago` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pedido_createdAt_idx`(`createdAt`),
    INDEX `Pedido_estado_reservaExpiraEn_idx`(`estado`, `reservaExpiraEn`),
    INDEX `Pedido_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoItem` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `stockReservado` BOOLEAN NOT NULL DEFAULT false,
    `garmentId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `precioUnitario` DECIMAL(10, 2) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `PedidoItem_pedidoId_idx`(`pedidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetodoPago` (
    `id` VARCHAR(191) NOT NULL,
    `metodo` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MetodoPago_activo_idx`(`activo`),
    UNIQUE INDEX `MetodoPago_metodo_key`(`metodo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
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
    INDEX `Payment_proveedor_idx`(`proveedor`),
    UNIQUE INDEX `Payment_proveedor_externalId_key`(`proveedor`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

