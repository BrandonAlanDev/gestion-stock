-- Reserva stock durante el checkout sin alterar el stock de pedidos existentes.
ALTER TABLE `Pedido`
    ADD COLUMN `stockReservado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reservaExpiraEn` DATETIME(3) NULL,
    ADD INDEX `Pedido_tenantId_estado_reservaExpiraEn_idx` (`tenantId`, `estado`, `reservaExpiraEn`);

ALTER TABLE `PedidoItem`
    ADD COLUMN `stockReservado` BOOLEAN NOT NULL DEFAULT false;
