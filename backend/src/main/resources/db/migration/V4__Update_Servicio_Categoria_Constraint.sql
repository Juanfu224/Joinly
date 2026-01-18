-- =============================================================================
-- V4: Actualizar constraint de categoría de servicio
-- =============================================================================
-- Añade la categoría PRODUCTIVIDAD al constraint de la tabla servicio.
-- Esto permite crear servicios personalizados con esta categoría.
-- =============================================================================

-- Eliminar constraint existente
ALTER TABLE servicio DROP CONSTRAINT chk_servicio_categoria;

-- Crear nuevo constraint con PRODUCTIVIDAD incluida
ALTER TABLE servicio 
ADD CONSTRAINT chk_servicio_categoria 
CHECK (categoria IN ('STREAMING', 'MUSICA', 'VPN', 'GAMING', 'SOFTWARE', 'ALMACENAMIENTO', 'PRODUCTIVIDAD', 'OTROS'));
