-- =============================================================================
-- Joinly - MySQL Initial Configuration
-- =============================================================================
-- Este script se ejecuta automáticamente cuando se crea el contenedor MySQL
-- por primera vez. Configura optimizaciones y permisos.
-- =============================================================================

-- Configurar charset por defecto
ALTER DATABASE IF EXISTS bbdd_joinly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Mensaje de confirmación
SELECT 'Joinly MySQL initialized successfully' AS message;
