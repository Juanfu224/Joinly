#!/usr/bin/env bash
# =============================================================================
# Joinly - Deploy Script
# =============================================================================
# Uso: ./scripts/deploy.sh [--build] [--restart] [--logs]
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BUILD="" RESTART=false LOGS=false

# Colores
info() { echo -e "\033[0;34m[INFO]\033[0m $1"; }
ok() { echo -e "\033[0;32m[OK]\033[0m $1"; }
err() { echo -e "\033[0;31m[ERROR]\033[0m $1"; exit 1; }

# Args
while [[ $# -gt 0 ]]; do
    case $1 in
        --build) BUILD="--build"; shift ;;
        --restart) RESTART=true; shift ;;
        --logs) LOGS=true; shift ;;
        --help) echo "Uso: $0 [--build] [--restart] [--logs]"; exit 0 ;;
        *) shift ;;
    esac
done

# Verificaciones
[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado"
[ ! -f ".env" ] && ln -sf .env.prod .env

source "$ENV_FILE"
[[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]] && err "DOMAIN no configurado"
[[ -z "${JWT_SECRET_KEY:-}" || "$JWT_SECRET_KEY" == *"GENERAR"* ]] && err "JWT_SECRET_KEY no configurado"

# SSL autofirmado si no existe
if [ ! -f "ssl/nginx.crt" ]; then
    mkdir -p ssl
    info "Generando certificados SSL autofirmados..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/nginx.key -out ssl/nginx.crt \
        -subj "/CN=${DOMAIN}/O=Joinly/C=ES" 2>/dev/null
    chmod 644 ssl/nginx.crt ssl/nginx.key
    ok "Certificados generados"
fi

# Backup si existe MySQL
if docker ps -q -f name=joinly-mysql-prod &>/dev/null; then
    info "Creando backup..."
    mkdir -p backups
    docker exec joinly-mysql-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
        "$MYSQL_DATABASE" 2>/dev/null | gzip > "backups/pre_deploy_$(date +%Y%m%d_%H%M%S).sql.gz" || true
fi

# Deploy
export $(grep -v '^#' "$ENV_FILE" | xargs)

if [ "$RESTART" = true ]; then
    info "Reiniciando servicios..."
    docker compose -f "$COMPOSE_FILE" restart
else
    info "Desplegando..."
    docker compose -f "$COMPOSE_FILE" up -d $BUILD
fi

# Wait health
info "Esperando servicios..."
for i in {1..60}; do
    if docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | grep -qE '"starting"|"unhealthy"'; then
        sleep 2
    else
        break
    fi
done

# Status
echo ""
docker compose -f "$COMPOSE_FILE" ps
echo ""
ok "Deploy completado: https://$DOMAIN"

[ "$LOGS" = true ] && docker compose -f "$COMPOSE_FILE" logs -f
