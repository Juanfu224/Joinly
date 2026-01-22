#!/usr/bin/env bash
# =============================================================================
# Joinly - Deploy Script (Optimizado y Automatizado)
# =============================================================================
# Uso: ./scripts/deploy.sh [--build] [--restart] [--logs] [--no-pull]
#
# Este script:
#   1. Verifica dependencias (Docker, git)
#   2. Actualiza código desde Git (opcional)
#   3. Valida configuración
#   4. Crea backup pre-deploy
#   5. Despliega con Docker Compose
#   6. Espera health checks
#   7. Verifica funcionamiento post-deploy
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="$(pwd)"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BUILD=""
RESTART=false
LOGS=false
NO_PULL=false
MAX_WAIT=120

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    🚀 JOINLY DEPLOY                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --build) BUILD="--build"; shift ;;
        --restart) RESTART=true; shift ;;
        --logs) LOGS=true; shift ;;
        --no-pull) NO_PULL=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --build     Reconstruir imágenes Docker"
            echo "  --restart   Solo reiniciar servicios (no recrear)"
            echo "  --logs      Mostrar logs después del deploy"
            echo "  --no-pull   No actualizar desde Git"
            echo "  --help      Mostrar esta ayuda"
            exit 0
            ;;
        *) shift ;;
    esac
done

# =============================================================================
# 1. VERIFICAR DEPENDENCIAS
# =============================================================================
info "Verificando dependencias..."

command -v docker &>/dev/null || err "Docker no instalado. Ejecutar: curl -fsSL https://get.docker.com | sh"
command -v git &>/dev/null || err "Git no instalado"
docker compose version &>/dev/null || err "Docker Compose no disponible"
docker info &>/dev/null || err "Docker daemon no está corriendo"

ok "Dependencias verificadas"

# =============================================================================
# 2. VERIFICAR CONFIGURACIÓN
# =============================================================================
info "Verificando configuración..."

[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado. Crear desde .env.prod.example"
[ ! -f ".env" ] && ln -sf .env.prod .env

set -a; source "$ENV_FILE"; set +a

[[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]] && err "DOMAIN no configurado en $ENV_FILE"
[[ -z "${JWT_SECRET_KEY:-}" || "$JWT_SECRET_KEY" == *"GENERAR"* ]] && err "JWT_SECRET_KEY no configurado"
[[ -z "${MYSQL_ROOT_PASSWORD:-}" || "$MYSQL_ROOT_PASSWORD" == *"GENERAR"* ]] && err "MYSQL_ROOT_PASSWORD no configurado"
[[ -z "${ENCRYPTION_KEY:-}" || "$ENCRYPTION_KEY" == *"GENERAR"* ]] && err "ENCRYPTION_KEY no configurado"

ok "Configuración válida (DOMAIN=$DOMAIN)"

# =============================================================================
# 3. ACTUALIZAR CÓDIGO DESDE GIT
# =============================================================================
if [ "$NO_PULL" = false ] && [ -d ".git" ]; then
    info "Verificando actualizaciones de Git..."
    
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    git fetch origin "$CURRENT_BRANCH" --quiet 2>/dev/null || true
    
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse "origin/$CURRENT_BRANCH" 2>/dev/null || echo "$LOCAL")
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        info "Descargando cambios desde Git..."
        git pull origin "$CURRENT_BRANCH" --quiet || warn "No se pudo actualizar desde Git"
        BUILD="--build"
        ok "Código actualizado"
    else
        ok "Código ya está actualizado"
    fi
fi

# =============================================================================
# 4. GENERAR CERTIFICADOS SSL AUTOFIRMADOS
# =============================================================================
if [ ! -f "ssl/nginx.crt" ]; then
    info "Generando certificados SSL autofirmados..."
    mkdir -p ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/nginx.key -out ssl/nginx.crt \
        -subj "/CN=${DOMAIN}/O=Joinly/C=ES" 2>/dev/null
    chmod 644 ssl/nginx.crt ssl/nginx.key
    ok "Certificados SSL generados"
fi

# =============================================================================
# 5. BACKUP PRE-DEPLOY
# =============================================================================
if docker ps -q -f name=joinly-mysql-prod &>/dev/null 2>&1; then
    info "Creando backup pre-deploy..."
    mkdir -p backups
    BACKUP_FILE="backups/pre_deploy_$(date +%Y%m%d_%H%M%S).sql.gz"
    if docker exec joinly-mysql-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
        --single-transaction --quick "$MYSQL_DATABASE" 2>/dev/null | gzip > "$BACKUP_FILE"; then
        ok "Backup creado: $BACKUP_FILE"
    else
        warn "No se pudo crear backup (primera instalación?)"
        rm -f "$BACKUP_FILE"
    fi
fi

# =============================================================================
# 6. DESPLEGAR
# =============================================================================
if [ "$RESTART" = true ]; then
    info "Reiniciando servicios..."
    docker compose -f "$COMPOSE_FILE" restart
else
    info "Desplegando servicios..."
    docker compose -f "$COMPOSE_FILE" pull mysql certbot 2>/dev/null || true
    
    if ! docker compose -f "$COMPOSE_FILE" up -d $BUILD 2>&1; then
        err "Error durante el despliegue. Ver logs: docker compose -f $COMPOSE_FILE logs"
    fi
fi

# =============================================================================
# 7. ESPERAR HEALTH CHECKS
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

echo -n "  MySQL: "
wait_for_healthy "joinly-mysql-prod" 60 && echo -e " ${GREEN}✓${NC}" || echo -e " ${YELLOW}⏳${NC}"

echo -n "  Backend: "
wait_for_healthy "joinly-backend-prod" "$MAX_WAIT" && echo -e " ${GREEN}✓${NC}" || echo -e " ${RED}✗${NC}"

echo -n "  Nginx: "
wait_for_healthy "joinly-nginx-prod" 30 && echo -e " ${GREEN}✓${NC}" || echo -e " ${RED}✗${NC}"

# =============================================================================
# 8. VERIFICACIÓN POST-DEPLOY
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
    warn "HTTPS no accesible (ejecutar ./scripts/init-ssl.sh para Let's Encrypt)"
fi

# =============================================================================
# 9. ESTADO FINAL
# =============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
ok "Deploy completado: https://$DOMAIN"
echo ""
echo -e "  📝 Logs: docker compose -f $COMPOSE_FILE logs -f"
echo -e "  🔐 SSL:  ./scripts/init-ssl.sh"
echo ""

[ "$LOGS" = true ] && docker compose -f "$COMPOSE_FILE" logs -f
