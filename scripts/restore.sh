#!/usr/bin/env bash
# =============================================================================
# Joinly - Restore Script
# =============================================================================
# Uso: ./scripts/restore.sh <backup.sql.gz>
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
CONTAINER="joinly-mysql-prod"

[ -z "${1:-}" ] && { echo "Uso: $0 <backup.sql.gz>"; ls -lh backups/*.sql* 2>/dev/null || true; exit 1; }
[ -f "$1" ] || { echo "[ERROR] Archivo no encontrado: $1"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "[ERROR] $ENV_FILE no encontrado"; exit 1; }

source "$ENV_FILE"
docker ps -q -f name=$CONTAINER &>/dev/null || { echo "[ERROR] $CONTAINER no está corriendo"; exit 1; }

echo "⚠️  ADVERTENCIA: Esto REEMPLAZARÁ todos los datos"
read -p "Escribir 'SI' para confirmar: " CONFIRM
[ "$CONFIRM" != "SI" ] && { echo "Cancelado"; exit 0; }

# Backup previo
echo "[INFO] Backup de seguridad..."
./scripts/backup.sh --keep 1 2>/dev/null || true

# Restaurar
echo "[INFO] Restaurando..."
if [[ "$1" == *.gz ]]; then
    gunzip -c "$1" | docker exec -i $CONTAINER mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"
else
    docker exec -i $CONTAINER mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$1"
fi

echo "[OK] Restauración completada"
docker restart joinly-backend-prod 2>/dev/null || true
