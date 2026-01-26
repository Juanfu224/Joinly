#!/usr/bin/env bash
# =============================================================================
# Joinly - Rollback Script (Despliegue Fallido)
# =============================================================================
# Uso: ./scripts/rollback.sh [--version TAG] [--no-confirm]
#
# Este script:
#   1. Detiene los servicios actuales
#   2. Restaura backup de la base de datos (si existe)
#   3. Vuelve a imágenes Docker anteriores (si están disponibles)
#   4. Reinicia servicios con la versión anterior
#   5. Verifica que todo funcione correctamente
#
# NOTA: Este script debe usarse solo si el despliegue actual falla
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="backups"
BACKUP_TO_RESTORE=""
NO_CONFIRM=false
FORCE_DB=false

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }

# Trap para limpieza en caso de error
cleanup() {
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo ""
        err "El rollback falló con código de salida: $EXIT_CODE"
        echo ""
        warn "Los servicios pueden estar en un estado inconsistente"
        warn "Ejecuta: docker compose -f $COMPOSE_FILE ps"
        warn "Para reiniciar: docker compose -f $COMPOSE_FILE restart"
    fi
    exit $EXIT_CODE
}
trap cleanup EXIT

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --backup|-b) BACKUP_TO_RESTORE="$2"; shift 2 ;;
        --no-confirm) NO_CONFIRM=true; shift ;;
        --force-db) FORCE_DB=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --backup FILE  Usar backup específico (ej: backups/joinly_20240126_120000.sql.gz)"
            echo "  --force-db     Forzar restauración de BD (peligroso)"
            echo "  --no-confirm   No pedir confirmación"
            echo "  --help         Mostrar esta ayuda"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Banner
echo -e "${RED}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ⚠️  ROLLBACK                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Cargar configuración
[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado"
set -a; source "$ENV_FILE"; set +a

# Confirmación
if [ "$NO_CONFIRM" = false ]; then
    warn "⚠️  ESTÁS A PUNTO DE REVERTIR EL DESPLIEGUE"
    warn ""
    warn "Esto hará:"
    warn "  1. Detener los servicios actuales"
    warn "  2. Restaurar backup de la base de datos (si selecciona uno)"
    warn "  3. Reiniciar servicios"
    warn ""
    read -p "¿Estás seguro de continuar? (escribe 'rollback' para confirmar): " -r
    echo
    [[ ! "$REPLY" =~ ^rollback$ ]] && { warn "Cancelado"; exit 0; }
fi

# =============================================================================
# 1. SELECCIONAR BACKUP
# =============================================================================
info "Seleccionando backup de la base de datos..."

if [ -z "$BACKUP_TO_RESTORE" ]; then
    # Listar backups disponibles
    BACKUPS=$(ls -1t "$BACKUP_DIR"/joinly_*.sql.gz 2>/dev/null || echo "")
    
    if [ -z "$BACKUPS" ]; then
        warn "No hay backups disponibles en $BACKUP_DIR"
        read -p "¿Continuar sin restaurar BD? (y/n) " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
    else
        info "Backups disponibles:"
        echo ""
        ls -lht "$BACKUP_DIR"/joinly_*.sql.gz 2>/dev/null | head -5
        echo ""
        
        if [ "$NO_CONFIRM" = false ]; then
            read -p "Usar el backup más reciente? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                BACKUP_TO_RESTORE=$(ls -1t "$BACKUP_DIR"/joinly_*.sql.gz 2>/dev/null | head -1)
            else
                read -p "Especificar archivo de backup: " BACKUP_TO_RESTORE
            fi
        else
            BACKUP_TO_RESTORE=$(ls -1t "$BACKUP_DIR"/joinly_*.sql.gz 2>/dev/null | head -1)
        fi
    fi
fi

# =============================================================================
# 2. VERIFICAR BACKUP
# =============================================================================
if [ -n "$BACKUP_TO_RESTORE" ] && [ -f "$BACKUP_TO_RESTORE" ]; then
    info "Backup seleccionado: $BACKUP_TO_RESTORE"
    
    # Verificar integridad del backup
    if ! gunzip -t "$BACKUP_TO_RESTORE" 2>/dev/null; then
        err "Backup corrupto, abortando"
    fi
    
    BACKUP_SIZE=$(du -h "$BACKUP_TO_RESTORE" | cut -f1)
    info "Tamaño del backup: $BACKUP_SIZE"
elif [ -n "$BACKUP_TO_RESTORE" ]; then
    err "Backup no encontrado: $BACKUP_TO_RESTORE"
fi

# =============================================================================
# 3. DETENER SERVICIOS
# =============================================================================
info "Deteniendo servicios..."

docker compose -f "$COMPOSE_FILE" stop nginx backend || warn "Error deteniendo servicios"

ok "Servicios detenidos"

# =============================================================================
# 4. RESTAURAR BACKUP DE BD
# =============================================================================
if [ -n "$BACKUP_TO_RESTORE" ] && [ -f "$BACKUP_TO_RESTORE" ]; then
    info "Restaurando base de datos..."
    
    # Verificar que MySQL está corriendo
    if ! docker ps -q -f name=joinly-mysql-prod &>/dev/null; then
        docker compose -f "$COMPOSE_FILE" start mysql
        sleep 5
    fi
    
    # Restaurar backup
    gunzip -c "$BACKUP_TO_RESTORE" | docker exec -i joinly-mysql-prod mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" && {
        ok "Base de datos restaurada exitosamente"
    } || err "Error restaurando base de datos"
else
    warn "Omitiendo restauración de BD"
fi

# =============================================================================
# 5. REINICIAR SERVICIOS
# =============================================================================
info "Reiniciando servicios..."

docker compose -f "$COMPOSE_FILE" up -d nginx backend

ok "Servicios reiniciados"

# =============================================================================
# 6. ESPERAR HEALTH CHECKS
# =============================================================================
info "Esperando que los servicios estén listos..."

wait_for_healthy() {
    local service=$1 max_wait=$2 waited=0
    while [ $waited -lt $max_wait ]; do
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "starting")
        [ "$STATUS" = "healthy" ] && return 0
        [ "$STATUS" = "unhealthy" ] && return 1
        sleep 2; waited=$((waited + 2)); printf "."
    done
    return 1
}

echo -n "  Backend: "
wait_for_healthy "joinly-backend-prod" 90 && echo -e " ${GREEN}✓${NC}" || echo -e " ${YELLOW}⏳${NC}"

echo -n "  Nginx: "
wait_for_healthy "joinly-nginx-prod" 30 && echo -e " ${GREEN}✓${NC}" || echo -e " ${RED}✗${NC}"

# =============================================================================
# 7. VERIFICAR FUNCIONAMIENTO
# =============================================================================
info "Verificando funcionamiento..."

sleep 2

if docker exec joinly-nginx-prod curl -sf http://localhost/nginx-health &>/dev/null; then
    ok "Health check interno OK"
else
    warn "Health check interno fallido"
fi

if curl -skf "https://${DOMAIN}/nginx-health" &>/dev/null 2>&1; then
    ok "HTTPS accesible"
else
    warn "HTTPS no accesible"
fi

# =============================================================================
# 8. RESUMEN
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✓ ROLLBACK COMPLETADO${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ -n "$BACKUP_TO_RESTORE" ]; then
    echo "  🗄️  Backup: $BACKUP_TO_RESTORE"
fi

echo ""
echo "  🌐 URL: https://$DOMAIN"
echo ""
echo "  Comandos útiles:"
echo "    - Ver logs: docker compose -f $COMPOSE_FILE logs -f"
echo "    - Health check: ./scripts/health-check.sh"
echo "    - Estado: docker compose -f $COMPOSE_FILE ps"
echo ""

exit 0
