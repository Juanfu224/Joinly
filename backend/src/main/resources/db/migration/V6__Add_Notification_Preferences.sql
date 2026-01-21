-- Agregar columnas de preferencias de notificaciones al usuario
ALTER TABLE usuario
ADD COLUMN notif_solicitudes BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Notificaciones cuando alguien solicita unirse a tu grupo o suscripción',
ADD COLUMN notif_pagos BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Notificaciones cuando recibes un pago de algún miembro',
ADD COLUMN notif_recordatorios BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Recordatorios antes de que venza una suscripción',
ADD COLUMN notif_novedades BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Novedades y actualizaciones de Joinly';
