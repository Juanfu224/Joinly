-- V999: Datos de prueba para desarrollo
-- Usuarios: test@joinly.com (Password123!) | admin@joinly.com (Admin123!)

INSERT INTO usuario (nombre, email, password, fecha_registro, email_verificado, estado, rol)
VALUES ('Usuario Test', 'test@joinly.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), FALSE, 'ACTIVO', 'USER')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO usuario (nombre, email, password, fecha_registro, email_verificado, estado, rol)
VALUES ('Admin Test', 'admin@joinly.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW(), TRUE, 'ACTIVO', 'ADMIN')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
