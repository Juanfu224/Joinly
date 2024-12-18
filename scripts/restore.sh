#!/bin/bash
# =============================================================================
# Joinly - Script de Restauración de Base de Datos
# =============================================================================
# Restaura la base de datos desde un backup.
#
# Uso: ./scripts/restore.sh <archivo_backup>
#
# Ejemplos:
#   ./scripts/restore.sh backups/joinly_backup_20241219_030000.sql.gz
#   ./scripts/restore.sh backups/joinly_backup_20241219_030000.sql
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Configuración
ENV_FILE=".env.prod"
CONTAINER_NAME="joinly-mysql-prod"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Verificaciones
# =============================================================================

if [ -z "$1" ]; then
    log_error "Uso: $0 <archivo_backup>"
    echo ""
    echo "Backups disponibles:"
    ls -lh "$PROJECT_DIR/backups"/*.sql* 2>/dev/null || echo "  No hay backups disponibles"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo $ENV_FILE no encontrado"
    exit 1
fi

source "$ENV_FILE"

if ! docker ps -q -f name=$CONTAINER_NAME &> /dev/null; then
    log_error "Contenedor $CONTAINER_NAME no está corriendo"
    exit 1
fi

# =============================================================================
# Confirmación
# =============================================================================

echo ""
echo "=========================================="
echo "   JOINLY - RESTAURACIÓN DE BASE DE DATOS"
echo "=========================================="
echo ""
echo "Archivo de backup: $BACKUP_FILE"
echo "Base de datos: $MYSQL_DATABASE"
echo ""
log_warning "⚠️  ADVERTENCIA: Esta operación REEMPLAZARÁ todos los datos actuales"
echo ""
read -p "¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    log_info "Operación cancelada"
    exit 0
fi

# =============================================================================
# Crear backup de seguridad
# =============================================================================

log_info "Creando backup de seguridad antes de restaurar..."
"$SCRIPT_DIR/backup.sh" --output "$PROJECT_DIR/backups/pre-restore" --keep 1

# =============================================================================
# Restaurar
# =============================================================================

log_info "Iniciando restauración..."

# Descomprimir si es necesario
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log_info "Descomprimiendo backup..."
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
    CLEANUP_TEMP=true
else
    CLEANUP_TEMP=false
fi

# Restaurar
log_info "Restaurando base de datos..."
docker exec -i $CONTAINER_NAME mysql \
    -u root \
    -p"$MYSQL_ROOT_PASSWORD" \
    "$MYSQL_DATABASE" < "$BACKUP_FILE"

# Limpiar archivo temporal
if [ "$CLEANUP_TEMP" = true ]; then
    rm -f "$TEMP_FILE"
fi

# =============================================================================
# Verificación
# =============================================================================

log_info "Verificando restauración..."

TABLE_COUNT=$(docker exec $CONTAINER_NAME mysql \
    -u root \
    -p"$MYSQL_ROOT_PASSWORD" \
    -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE';" 2>/dev/null)

echo ""
log_success "Restauración completada"
echo ""
echo "Detalles:"
echo "  - Base de datos: $MYSQL_DATABASE"
echo "  - Tablas restauradas: $TABLE_COUNT"
echo ""
log_info "Reiniciando backend para limpiar caché..."
docker restart joinly-backend-prod 2>/dev/null || true

log_success "¡Restauración completada exitosamente!"
