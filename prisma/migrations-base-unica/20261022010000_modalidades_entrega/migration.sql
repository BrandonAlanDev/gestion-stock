ALTER TABLE `PageConfig`
  ADD COLUMN `envioDomicilioEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `retiroTiendaEnabled` BOOLEAN NOT NULL DEFAULT false;

-- Conserva el retiro en las tiendas que hoy lo ofrecen mediante la ubicación pública.
UPDATE `PageConfig` SET `retiroTiendaEnabled` = `locationEnabled`;
