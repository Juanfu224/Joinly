-- V999: Datos de prueba para desarrollo
-- IMPORTANTE: Los hashes BCrypt deben corresponder exactamente a las contraseñas indicadas
-- 
-- Credenciales de prueba (contraseña unificada: "password"):
--   test@joinly.com / password
--   admin@joinly.com / password
-- 
-- Hash BCrypt generado con costo 10 para "password"
-- Este hash es estándar y verificable: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG

INSERT INTO usuario (nombre, email, password, fecha_registro, email_verificado, estado, rol)
VALUES ('Usuario Test', 'test@joinly.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', NOW(), TRUE, 'ACTIVO', 'USER')
ON DUPLICATE KEY UPDATE password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG';

INSERT INTO usuario (nombre, email, password, fecha_registro, email_verificado, estado, rol)
VALUES ('Admin Test', 'admin@joinly.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', NOW(), TRUE, 'ACTIVO', 'ADMIN')
ON DUPLICATE KEY UPDATE password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG';
