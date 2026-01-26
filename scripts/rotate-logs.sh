#!/usr/bin/env bash
# =============================================================================
# Joinly - Log Rotation Script (Docker Containers)
# =============================================================================
# Uso: ./scripts/rotate-logs.sh [--dry-run] [--force]
#
# Este script:
#   1. Rota logs de contenedores Docker
#   2. Comprime logs antiguos con gzip
#   3. Elimina logs antiguos (más de 30 días)
#   4. Puede ejecutarse via cron
#
# Cron ejemplo (diario a las 2am):
#   0 2 * * * /opt/joinly/scripts/rotate-logs.sh --quiet
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

LOG_DIR="logs/rotated"
DAYS_TO_KEEP=30
DRY_RUN=false
FORCE=false
QUIET=false

# Verificar dependencias
command -v docker &>/dev/null || err "Docker no instalado"
command -v gzip &>/dev/null || err "gzip no instalado"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { [ "$QUIET" = false ] && echo -e "$1"; }
info() { log "${YELLOW}[INFO]${NC} $1"; }
ok() { log "${GREEN}[OK]${NC} $1"; }
warn() { log "${YELLOW}[WARN]${NC} $1"; }
err() { log "${RED}[ERROR]${NC} $1"; }

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true; shift ;;
        --force) FORCE=true; shift ;;
        --quiet|-q) QUIET=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --dry-run  Solo mostrar qué se haría (sin ejecutar)"
            echo "  --force    Forzar rotación (incluso si logs son pequeños)"
            echo "  --quiet    Sin salida (para cron)"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Banner
if [ "$QUIET" = false ]; then
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              📋 LOG ROTATION                               ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
fi

# Crear directorio de logs rotados
mkdir -p "$LOG_DIR"

# Listar contenedores
CONTAINERS=$(docker ps --format "{{.Names}}" | grep -E "joinly-.*-prod" || true)

if [ -z "$CONTAINERS" ]; then
    warn "No hay contenedores de producción corriendo"
    exit 0
fi

info "Rotando logs de $(echo "$CONTAINERS" | wc -l) contenedor(es)..."

ROTATED_COUNT=0
DELETED_COUNT=0

for container in $CONTAINERS; do
    info "Procesando $container..."

    # Obtener tamaño del log
    LOG_SIZE=$(docker inspect --format='{{.LogPath}}' "$container" 2>/dev/null | xargs du -b 2>/dev/null | cut -f1 || echo "0")
    
    # Solo rotar si es >10MB o si --force
    if [ "$LOG_SIZE" -gt 10485760 ] || [ "$FORCE" = true ]; then
        LOG_SIZE_HUMAN=$(numfmt --to=iec-i --suffix=B "$LOG_SIZE" 2>/dev/null || echo "$LOG_SIZE")
        
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        ROTATED_LOG="$LOG_DIR/${container}_${TIMESTAMP}.log"
        
        if [ "$DRY_RUN" = true ]; then
            info "  [DRY-RUN] Rotar log: $LOG_SIZE_HUMAN -> $ROTATED_LOG"
        else
            # Copiar log actual
            docker logs "$container" 2>&1 > "$ROTATED_LOG" && {
                ROTATED_COUNT=$((ROTATED_COUNT + 1))
                
                # Comprimir con gzip
                gzip "$ROTATED_LOG"
                ok "  Log rotado y comprimido: $ROTATED_LOG.gz"
            } || warn "  Error rotando log de $container"
        fi
    fi
done

# Eliminar logs antiguos
info "Eliminando logs antiguos (> $DAYS_TO_KEEP días)..."

DELETED=$(find "$LOG_DIR" -name "*.log.gz" -type f -mtime +$DAYS_TO_KEEP -print 2>/dev/null | wc -l)

if [ "$DELETED" -gt 0 ]; then
    if [ "$DRY_RUN" = true ]; then
        info "  [DRY-RUN] Eliminar $DELETED archivo(s) antiguo(s)"
    else
        find "$LOG_DIR" -name "*.log.gz" -type f -mtime +$DAYS_TO_KEEP -delete 2>/dev/null || true
        ok "  Eliminados: $DELETED archivo(s) antiguo(s)"
    fi
    DELETED_COUNT=$DELETED
else
    info "  No hay logs antiguos para eliminar"
fi

# Resumen
if [ "$QUIET" = false ]; then
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Rotación de logs completada${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  Rotados:   $ROTATED_COUNT"
    echo "  Eliminados: $DELETED_COUNT"
    echo ""
    
    # Espacio total en logs
    TOTAL_SIZE=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1 || echo "0")
    echo "  Espacio total: $TOTAL_SIZE"
    echo ""
fi

exit 0
