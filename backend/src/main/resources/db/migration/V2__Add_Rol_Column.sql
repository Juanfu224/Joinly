-- =====================================================
-- Migración V2: Añadir columna 'rol' al sistema de roles unificado
-- Autor: Joinly Team
-- Fecha: 15/12/2025
-- Descripción: Migración del sistema de roles de boolean a enum
-- =====================================================

-- Añadir columna rol con valor por defecto USER
ALTER TABLE usuario
ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'USER' AFTER email_verificado;

-- Actualizar roles basándose en el campo legacy es_agente_soporte
-- Los usuarios que eran agentes de soporte ahora son AGENTE
UPDATE usuario
SET rol = 'AGENTE'
WHERE es_agente_soporte = TRUE;

-- Crear índice para mejorar consultas por rol
CREATE INDEX idx_usuario_rol ON usuario(rol);

-- Nota: El campo es_agente_soporte se mantiene temporalmente por compatibilidad
-- pero está marcado como @Deprecated en el código y será eliminado en versión futura
