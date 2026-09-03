-- Paso B: contrato multitenant final, posterior al backfill y sus validaciones.
-- Este archivo documenta el cambio aplicado operativamente mediante prisma db push.

-- Endurecer tenantId en las 29 tablas existentes.
ALTER TABLE `Banner` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `BoardDeliveryOption` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `BoardFinConfigOption` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `BoardFinOption` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `BoardMaterialOption` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `BoardTailOption` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `BoardTypeOption` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Carousel` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `CarouselSlide` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Category` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Color` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `ContactProvider` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `CustomBoard` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `CustomPageItems` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `CustomPageSections` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `CustomPages` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Garment` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `GarmentImage` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `GarmentVariant` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Grid` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Homegrid` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Movement` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `PageConfig` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Provider` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `Size` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `SizeType` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `SubCategory` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `account` MODIFY `tenantId` VARCHAR(191) NOT NULL;
ALTER TABLE `user` MODIFY `tenantId` VARCHAR(191) NOT NULL;

-- Unicidades cuya semántica pertenece al tenant.
DROP INDEX `account_provider_providerAccountId_key` ON `account`;
CREATE UNIQUE INDEX `account_tenantId_provider_providerAccountId_key`
  ON `account`(`tenantId`, `provider`, `providerAccountId`);

DROP INDEX `User_email_key` ON `user`;
CREATE UNIQUE INDEX `user_tenantId_email_key` ON `user`(`tenantId`, `email`);

DROP INDEX `Category_name_key` ON `Category`;
CREATE UNIQUE INDEX `Category_tenantId_name_key` ON `Category`(`tenantId`, `name`);

DROP INDEX `GarmentVariant_sku_key` ON `GarmentVariant`;
CREATE UNIQUE INDEX `GarmentVariant_tenantId_sku_key`
  ON `GarmentVariant`(`tenantId`, `sku`);

DROP INDEX `SizeType_name_key` ON `SizeType`;
CREATE UNIQUE INDEX `SizeType_tenantId_name_key` ON `SizeType`(`tenantId`, `name`);

DROP INDEX `Color_name_key` ON `Color`;
CREATE UNIQUE INDEX `Color_tenantId_name_key` ON `Color`(`tenantId`, `name`);

DROP INDEX `Provider_name_key` ON `Provider`;
CREATE UNIQUE INDEX `Provider_tenantId_name_key` ON `Provider`(`tenantId`, `name`);

DROP INDEX `BoardTypeOption_name_key` ON `BoardTypeOption`;
CREATE UNIQUE INDEX `BoardTypeOption_tenantId_name_key`
  ON `BoardTypeOption`(`tenantId`, `name`);

DROP INDEX `BoardMaterialOption_name_key` ON `BoardMaterialOption`;
CREATE UNIQUE INDEX `BoardMaterialOption_tenantId_name_key`
  ON `BoardMaterialOption`(`tenantId`, `name`);

DROP INDEX `BoardTailOption_name_key` ON `BoardTailOption`;
CREATE UNIQUE INDEX `BoardTailOption_tenantId_name_key`
  ON `BoardTailOption`(`tenantId`, `name`);

DROP INDEX `BoardFinOption_name_key` ON `BoardFinOption`;
CREATE UNIQUE INDEX `BoardFinOption_tenantId_name_key`
  ON `BoardFinOption`(`tenantId`, `name`);

DROP INDEX `BoardFinConfigOption_name_key` ON `BoardFinConfigOption`;
CREATE UNIQUE INDEX `BoardFinConfigOption_tenantId_name_key`
  ON `BoardFinConfigOption`(`tenantId`, `name`);

DROP INDEX `BoardDeliveryOption_label_key` ON `BoardDeliveryOption`;
CREATE UNIQUE INDEX `BoardDeliveryOption_tenantId_label_key`
  ON `BoardDeliveryOption`(`tenantId`, `label`);

DROP INDEX `CustomPages_slug_key` ON `CustomPages`;
CREATE UNIQUE INDEX `CustomPages_tenantId_slug_key`
  ON `CustomPages`(`tenantId`, `slug`);

-- PageConfig deja la identidad global fija y pasa a una fila por tenant.
ALTER TABLE `PageConfig` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;
DROP INDEX `PageConfig_tenantId_idx` ON `PageConfig`;
CREATE UNIQUE INDEX `PageConfig_tenantId_key` ON `PageConfig`(`tenantId`);

-- Los pares ya fueron copiados y validados en los puentes explícitos tenant-scoped.
DROP TABLE `_BoardTailOptionToBoardTypeOption`;
DROP TABLE `_BoardFinOptionToBoardTypeOption`;
DROP TABLE `_BoardFinConfigOptionToBoardTypeOption`;
