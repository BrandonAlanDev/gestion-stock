CREATE TABLE `admin_pending_email` (
    `email` VARCHAR(191) NOT NULL,
    `codigoHash` VARCHAR(64) NULL,
    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conserva los administradores Google creados por Core antes de esta migración.
-- El primer acceso verificado vincula la cuenta existente sin cambiar su ID.
INSERT IGNORE INTO `admin_pending_email` (`email`, `codigoHash`)
SELECT u.`email`, NULL
FROM `user` AS u
WHERE u.`role` = 'ADMIN' AND u.`password` IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM `account` AS a WHERE a.`userId` = u.`id`
  );
