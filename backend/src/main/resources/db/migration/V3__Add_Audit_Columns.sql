-- =====================================================
-- Flyway Migration V3: Add Audit Columns
-- Adds created_at and updated_at columns to all tables
-- that extend BaseEntity (if they don't exist)
-- =====================================================

-- Procedimiento para añadir columna si no existe
DROP PROCEDURE IF EXISTS add_audit_columns;

DELIMITER //

CREATE PROCEDURE add_audit_columns(IN tableName VARCHAR(64))
BEGIN
    -- Check and add created_at
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = tableName 
        AND COLUMN_NAME = 'created_at'
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    -- Check and add updated_at
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = tableName 
        AND COLUMN_NAME = 'updated_at'
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

-- Aplicar a todas las tablas que extienden BaseEntity
CALL add_audit_columns('usuario');
CALL add_audit_columns('token');
CALL add_audit_columns('servicio');
CALL add_audit_columns('suscripcion');
CALL add_audit_columns('plaza');
CALL add_audit_columns('solicitud');
CALL add_audit_columns('unidad_familiar');
CALL add_audit_columns('miembro_unidad');
CALL add_audit_columns('metodo_pago_usuario');
CALL add_audit_columns('notificacion');
CALL add_audit_columns('ticket_soporte');
CALL add_audit_columns('mensaje_ticket');
CALL add_audit_columns('disputa');
CALL add_audit_columns('log_auditoria');
CALL add_audit_columns('historial_anfitrion');
CALL add_audit_columns('historial_credencial');

-- Limpiar el procedimiento
DROP PROCEDURE IF EXISTS add_audit_columns;

