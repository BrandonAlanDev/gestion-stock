-- El runner administrativo verifica soporte, configuración y filas negativas antes del deploy.
ALTER TABLE `GarmentVariant`
ADD CONSTRAINT `GarmentVariant_stock_nonnegative_chk`
CHECK (`stock` >= 0);
