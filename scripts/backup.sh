#!/usr/bin/env bash
# =============================================================================
# Joinly - Backup Script (Automatizado)
# =============================================================================
# Uso: ./scripts/backup.sh [--keep N] [--upload] [--quiet]
#
# Este script:
#   1. Crea backup de la base de datos MySQL
#   2. Opcionalmente sube a almacenamiento remoto
#   3. Rota backups antiguos
#   4. Puede ejecutarse via cron
#
# Cron ejemplo (diario a las 3am):
#   0 3 * * * /opt/joinly/scripts/backup.sh --keep 7 --quiet >> /var/log/joinly-backup.log 2>&1
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
OUTPUT_DIR="backups"
KEEP=7
CONTAINER="joinly-mysql-prod"
QUIET=false
UPLOAD=false

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log() { [ "$QUIET" = false ] && echo -e "$1"; }
info() { log "${YELLOW}[INFO]${NC} $1"; }
ok() { log "${GREEN}[OK]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --keep) KEEP="$2"; shift 2 ;;
        --upload) UPLOAD=true; shift ;;
        --quiet|-q) QUIET=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --keep N    Mantener N backups (default: 7)"
            echo "  --upload    Subir a almacenamiento remoto (requiere configuración)"
            echo "  --quiet     Sin salida (para cron)"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Verificar configuración
[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado"
set -a; source "$ENV_FILE"; set +a

# Verificar contenedor
if ! docker ps -q -f name=$CONTAINER &>/dev/null; then
    err "Contenedor $CONTAINER no está corriendo"
fi

# Crear directorio de backups
mkdir -p "$OUTPUT_DIR"

# Generar nombre de archivo
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$OUTPUT_DIR/joinly_${TIMESTAMP}.sql.gz"

# Crear backup
info "Creando backup de la base de datos..."

if docker exec $CONTAINER mysqldump \
    -u root -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    "$MYSQL_DATABASE" 2>/dev/null | gzip > "$BACKUP_FILE"; then
    
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    ok "Backup creado: $BACKUP_FILE ($SIZE)"
else
    rm -f "$BACKUP_FILE"
    err "Error creando backup"
fi

# Verificar integridad del backup
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    rm -f "$BACKUP_FILE"
    err "Backup corrupto, eliminado"
fi

# Subir a almacenamiento remoto (si está configurado)
if [ "$UPLOAD" = true ]; then
    if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
        info "Subiendo a S3..."
        if command -v aws &>/dev/null; then
            aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/$(basename "$BACKUP_FILE")" && ok "Subido a S3"
        else
            info "AWS CLI no instalado, omitiendo upload"
        fi
    fi
fi

# Rotación de backups antiguos
info "Rotando backups (manteniendo $KEEP)..."
DELETED=$(ls -1t "$OUTPUT_DIR"/joinly_*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | wc -l)
ls -1t "$OUTPUT_DIR"/joinly_*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

TOTAL=$(ls -1 "$OUTPUT_DIR"/joinly_*.sql.gz 2>/dev/null | wc -l)
ok "Backups: $TOTAL (eliminados: $DELETED)"

# Resumen
[ "$QUIET" = false ] && echo "" && ls -lh "$OUTPUT_DIR"/joinly_*.sql.gz 2>/dev/null | tail -5
