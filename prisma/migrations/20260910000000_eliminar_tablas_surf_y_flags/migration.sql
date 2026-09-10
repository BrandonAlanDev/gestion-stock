-- Limpieza de la antigua tienda de surf para dejar un e-commerce genérico.

-- 1. Quita los flags de módulos de la tienda anterior y los límites de carrusel sin uso.
ALTER TABLE `PageConfig`
  DROP COLUMN `arreglosEnabled`,
  DROP COLUMN `escuelaEnabled`,
  DROP COLUMN `personalizadoEnabled`,
  DROP COLUMN `planAhorroEnabled`,
  DROP COLUMN `carouselHeroLimit`,
  DROP COLUMN `carouselBannerLimit`,
  DROP COLUMN `carouselCardsLimit`;

-- 2. Elimina las tablas del módulo de tablas de surf personalizadas.
DROP TABLE IF EXISTS `BoardTypeTailOption`;
DROP TABLE IF EXISTS `BoardTypeFinOption`;
DROP TABLE IF EXISTS `BoardTypeFinConfigOption`;
DROP TABLE IF EXISTS `BoardTypeOption`;
DROP TABLE IF EXISTS `BoardTailOption`;
DROP TABLE IF EXISTS `BoardFinOption`;
DROP TABLE IF EXISTS `BoardFinConfigOption`;
DROP TABLE IF EXISTS `BoardMaterialOption`;
DROP TABLE IF EXISTS `BoardDeliveryOption`;
DROP TABLE IF EXISTS `CustomBoard`;
