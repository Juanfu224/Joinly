#!/usr/bin/env bash
# =============================================================================
# Joinly - Backup Script
# =============================================================================
# Uso: ./scripts/backup.sh [--keep N]
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
OUTPUT_DIR="backups"
KEEP=7
CONTAINER="joinly-mysql-prod"

while [[ $# -gt 0 ]]; do
    case $1 in
        --keep) KEEP="$2"; shift 2 ;;
        --help) echo "Uso: $0 [--keep N]"; exit 0 ;;
        *) shift ;;
    esac
done

[ -f "$ENV_FILE" ] || { echo "[ERROR] $ENV_FILE no encontrado"; exit 1; }
source "$ENV_FILE"

docker ps -q -f name=$CONTAINER &>/dev/null || { echo "[ERROR] $CONTAINER no está corriendo"; exit 1; }

mkdir -p "$OUTPUT_DIR"
BACKUP="$OUTPUT_DIR/joinly_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "[INFO] Creando backup..."
docker exec $CONTAINER mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction --quick "$MYSQL_DATABASE" | gzip > "$BACKUP"

echo "[OK] Backup: $BACKUP ($(du -h "$BACKUP" | cut -f1))"

# Rotación
ls -1t "$OUTPUT_DIR"/joinly_*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
echo "[INFO] Backups: $(ls -1 "$OUTPUT_DIR"/joinly_*.sql.gz 2>/dev/null | wc -l)/$KEEP"
