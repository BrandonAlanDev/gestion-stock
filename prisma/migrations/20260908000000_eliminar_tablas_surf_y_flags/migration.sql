-- Eliminación de lógica específica de la tienda de surf para el Ecommerce genérico.

-- 1. Quitar los flags de módulos de surf del PageConfig
ALTER TABLE `PageConfig`
  DROP COLUMN `arreglosEnabled`,
  DROP COLUMN `escuelaEnabled`,
  DROP COLUMN `personalizadoEnabled`,
  DROP COLUMN `planAhorroEnabled`;

-- 2. Eliminar tablas del módulo de tablas de surf personalizadas.
--    Primero los puentes M:N (dependen de los modelos padre), luego los padres, luego las opciones sueltas.
DROP TABLE `BoardTypeTailOption`;
DROP TABLE `BoardTypeFinOption`;
DROP TABLE `BoardTypeFinConfigOption`;
DROP TABLE `BoardTypeOption`;
DROP TABLE `BoardTailOption`;
DROP TABLE `BoardFinOption`;
DROP TABLE `BoardFinConfigOption`;
DROP TABLE `BoardMaterialOption`;
DROP TABLE `BoardDeliveryOption`;
DROP TABLE `CustomBoard`;
