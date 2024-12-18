#!/bin/bash
# =============================================================================
# Joinly - Script de Backup de Base de Datos
# =============================================================================
# Crea backups de la base de datos MySQL.
# Diseñado para ejecutarse manualmente o via cron.
#
# Uso: ./scripts/backup.sh [opciones]
#
# Opciones:
#   --output DIR    Directorio de salida (default: ./backups)
#   --keep N        Mantener últimos N backups (default: 7)
#   --compress      Comprimir backup con gzip (default: true)
#   --help          Mostrar ayuda
#
# Cron ejemplo (diario a las 3:00 AM):
#   0 3 * * * /path/to/joinly/scripts/backup.sh >> /var/log/joinly-backup.log 2>&1
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

# Configuración por defecto
ENV_FILE=".env.prod"
OUTPUT_DIR="$PROJECT_DIR/backups"
KEEP_BACKUPS=7
COMPRESS=true
CONTAINER_NAME="joinly-mysql-prod"

log_info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $1"; }

show_help() {
    echo "Joinly - Script de Backup de Base de Datos"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --output DIR    Directorio de salida (default: ./backups)"
    echo "  --keep N        Mantener últimos N backups (default: 7)"
    echo "  --no-compress   No comprimir backup"
    echo "  --help          Mostrar ayuda"
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --keep)
            KEEP_BACKUPS="$2"
            shift 2
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# =============================================================================
# Verificaciones
# =============================================================================

if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo $ENV_FILE no encontrado"
    exit 1
fi

source "$ENV_FILE"

if ! docker ps -q -f name=$CONTAINER_NAME &> /dev/null; then
    log_error "Contenedor $CONTAINER_NAME no está corriendo"
    exit 1
fi

# Crear directorio de backups
mkdir -p "$OUTPUT_DIR"

# =============================================================================
# Crear Backup
# =============================================================================

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$OUTPUT_DIR/joinly_backup_$TIMESTAMP.sql"

log_info "Iniciando backup de base de datos..."
log_info "Contenedor: $CONTAINER_NAME"
log_info "Base de datos: $MYSQL_DATABASE"

# Crear backup
docker exec $CONTAINER_NAME mysqldump \
    -u root \
    -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    "$MYSQL_DATABASE" > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ]; then
    log_error "El backup está vacío o falló"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Comprimir si está habilitado
if [ "$COMPRESS" = true ]; then
    log_info "Comprimiendo backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_success "Backup creado: $BACKUP_FILE ($BACKUP_SIZE)"

# =============================================================================
# Rotación de Backups
# =============================================================================

log_info "Rotando backups (manteniendo últimos $KEEP_BACKUPS)..."

# Contar backups existentes
BACKUP_COUNT=$(ls -1 "$OUTPUT_DIR"/joinly_backup_*.sql* 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$KEEP_BACKUPS" ]; then
    # Eliminar backups antiguos
    DELETE_COUNT=$((BACKUP_COUNT - KEEP_BACKUPS))
    ls -1t "$OUTPUT_DIR"/joinly_backup_*.sql* | tail -n "$DELETE_COUNT" | while read FILE; do
        log_info "Eliminando backup antiguo: $(basename $FILE)"
        rm -f "$FILE"
    done
fi

# =============================================================================
# Resumen
# =============================================================================

echo ""
log_success "Backup completado exitosamente"
echo ""
echo "Detalles:"
echo "  - Archivo: $BACKUP_FILE"
echo "  - Tamaño: $BACKUP_SIZE"
echo "  - Backups almacenados: $(ls -1 "$OUTPUT_DIR"/joinly_backup_*.sql* 2>/dev/null | wc -l)"
echo ""
