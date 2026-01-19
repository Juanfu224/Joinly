-- =============================================================================
-- MIGRACIÓN V5: Agregar columna tema_preferido a tabla usuario
-- =============================================================================
-- Fecha: 2026-01-19
-- Autor: Sistema
-- Propósito: Permitir persistencia de preferencia de tema (light/dark)
-- =============================================================================

-- Agregar columna tema_preferido (nullable para permitir detección automática)
ALTER TABLE usuario
ADD COLUMN tema_preferido VARCHAR(10) DEFAULT NULL
COMMENT 'Preferencia de tema del usuario: light, dark o NULL (usar detección automática del sistema)';

-- Índice para mejorar performance en consultas por tema
CREATE INDEX idx_usuario_tema_preferido ON usuario(tema_preferido);

-- Constraint para validar valores permitidos
ALTER TABLE usuario
ADD CONSTRAINT chk_usuario_tema_preferido
CHECK (tema_preferido IS NULL OR tema_preferido IN ('light', 'dark'));

-- =============================================================================
-- NOTAS:
-- - NULL significa "usar detección automática" (prefers-color-scheme)
-- - 'light' y 'dark' son valores explícitos del usuario
-- - La aplicación frontend SIEMPRE tiene prioridad sobre este valor
-- =============================================================================
