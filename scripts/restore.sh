#!/usr/bin/env bash
# =============================================================================
# Joinly - Restore Script (Con verificación)
# =============================================================================
# Uso: ./scripts/restore.sh <backup.sql.gz> [--force]
#
# Este script:
#   1. Verifica el archivo de backup
#   2. Crea backup de seguridad antes de restaurar
#   3. Restaura la base de datos
#   4. Reinicia el backend para limpiar caché
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
CONTAINER="joinly-mysql-prod"
FORCE=false

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Parsear argumentos
BACKUP_FILE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f) FORCE=true; shift ;;
        --help|-h)
            echo "Uso: $0 <backup.sql.gz> [--force]"
            echo ""
            echo "Opciones:"
            echo "  --force    No pedir confirmación"
            echo ""
            echo "Backups disponibles:"
            ls -lh backups/*.sql* 2>/dev/null || echo "  (ninguno)"
            exit 0
            ;;
        -*) shift ;;
        *) BACKUP_FILE="$1"; shift ;;
    esac
done

# Verificaciones
[ -z "$BACKUP_FILE" ] && { echo "Uso: $0 <backup.sql.gz> [--force]"; echo ""; echo "Backups disponibles:"; ls -lh backups/*.sql* 2>/dev/null || echo "  (ninguno)"; exit 1; }
[ -f "$BACKUP_FILE" ] || err "Archivo no encontrado: $BACKUP_FILE"
[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado"

set -a; source "$ENV_FILE"; set +a

# Verificar contenedor
docker ps -q -f name=$CONTAINER &>/dev/null || err "Contenedor $CONTAINER no está corriendo"

# Verificar integridad del backup
info "Verificando integridad del backup..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
        err "Archivo de backup corrupto"
    fi
fi
ok "Backup válido: $(du -h "$BACKUP_FILE" | cut -f1)"

# Confirmación
if [ "$FORCE" = false ]; then
    echo ""
    echo -e "${RED}⚠️  ADVERTENCIA: Esto REEMPLAZARÁ todos los datos actuales${NC}"
    echo ""
    read -p "Escribir 'SI' para confirmar: " CONFIRM
    [ "$CONFIRM" != "SI" ] && { echo "Cancelado"; exit 0; }
fi

# Backup de seguridad
info "Creando backup de seguridad antes de restaurar..."
SAFETY_BACKUP="backups/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
if docker exec $CONTAINER mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction --quick "$MYSQL_DATABASE" 2>/dev/null | gzip > "$SAFETY_BACKUP"; then
    ok "Backup de seguridad: $SAFETY_BACKUP"
else
    rm -f "$SAFETY_BACKUP"
    info "No se pudo crear backup de seguridad (continuando...)"
fi

# Restaurar
info "Restaurando base de datos..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    if gunzip -c "$BACKUP_FILE" | docker exec -i $CONTAINER mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" 2>/dev/null; then
        ok "Base de datos restaurada"
    else
        err "Error durante la restauración"
    fi
else
    if docker exec -i $CONTAINER mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$BACKUP_FILE" 2>/dev/null; then
        ok "Base de datos restaurada"
    else
        err "Error durante la restauración"
    fi
fi

# Reiniciar backend para limpiar caché
info "Reiniciando backend..."
docker compose -f "$COMPOSE_FILE" restart backend &>/dev/null || docker restart joinly-backend-prod &>/dev/null || true

# Esperar a que el backend esté listo
info "Esperando que el backend esté listo..."
for i in {1..30}; do
    if docker exec joinly-backend-prod curl -sf http://localhost:8080/actuator/health &>/dev/null; then
        break
    fi
    sleep 2
done

echo ""
ok "Restauración completada"
echo ""
echo "  Backup restaurado: $BACKUP_FILE"
echo "  Backup seguridad:  $SAFETY_BACKUP"
echo ""
