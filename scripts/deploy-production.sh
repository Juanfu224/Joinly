#!/usr/bin/env bash
# =============================================================================
# Joinly - Production Deployment Master Script
# =============================================================================
# Este script combina todos los pasos necesarios para desplegar en producción
# según el punto 6 del plan de implementación:
#
#   6.1 Preparación del Servidor
#   6.2 Docker Build y Push
#   6.3 Despliegue en Producción
#   6.4 Configuración Nginx
#   6.5 Verificación Post-Despliegue
#
# Uso: sudo ./scripts/deploy-production.sh [opciones]
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="$(pwd)"

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"

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
step() { echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"; }

# Trap para limpieza en caso de error
cleanup() {
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo ""
        err "El despliegue falló con código de salida: $EXIT_CODE"
        echo ""
        info "Para más información, revisa los logs:"
        echo "  docker compose -f $COMPOSE_FILE logs --tail=50"
    fi
    exit $EXIT_CODE
}
trap cleanup EXIT

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🚀 JOINLY PRODUCTION DEPLOYMENT                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parsear argumentos
SKIP_SETUP=false
SKIP_BUILD=false
SKIP_SSL=false
SKIP_VERIFY=false
FULL_VERIFY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-setup) SKIP_SETUP=true; shift ;;
        --skip-build) SKIP_BUILD=true; shift ;;
        --skip-ssl) SKIP_SSL=true; shift ;;
        --skip-verify) SKIP_VERIFY=true; shift ;;
        --full-verify) FULL_VERIFY=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --skip-setup    Omitir configuración del servidor"
            echo "  --skip-build    Omitir build local"
            echo "  --skip-ssl      Omitir configuración SSL"
            echo "  --skip-verify   Omitir verificación post-despliegue"
            echo "  --full-verify   Ejecutar verificación completa"
            echo "  --help          Mostrar esta ayuda"
            exit 0
            ;;
        *) shift ;;
    esac
done

# =============================================================================
# PRE-CHECKS
# =============================================================================
step "0. Pre-Checks"

# Verificar que .env.prod existe
if [ ! -f "$ENV_FILE" ]; then
    err "Archivo $ENV_FILE no encontrado. Crear desde .env.prod.example"
fi

# Cargar configuración
set -a; source "$ENV_FILE"; set +a

# Verificar variables críticas
if [[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]]; then
    err "DOMAIN no configurado en $ENV_FILE"
fi

if [[ -z "${JWT_SECRET_KEY:-}" || "$JWT_SECRET_KEY" == *"GENERAR"* ]]; then
    err "JWT_SECRET_KEY no configurado. Generar con: openssl rand -base64 64"
fi

if [[ -z "${ENCRYPTION_KEY:-}" || "$ENCRYPTION_KEY" == *"GENERAR"* ]]; then
    err "ENCRYPTION_KEY no configurado. Generar con: openssl rand -base64 32"
fi

if [[ -z "${MYSQL_ROOT_PASSWORD:-}" || "$MYSQL_ROOT_PASSWORD" == *"GENERAR"* ]]; then
    err "MYSQL_ROOT_PASSWORD no configurado. Generar con: openssl rand -base64 32"
fi

ok "Variables de entorno válidas"

# =============================================================================
# 6.1 PREPARACIÓN DEL SERVIDOR
# =============================================================================
if [ "$SKIP_SETUP" = false ]; then
    step "6.1 Preparación del Servidor"

    info "Verificando dependencias..."
    command -v docker &>/dev/null || err "Docker no instalado. Ejecutar: curl -fsSL https://get.docker.com | sh"
    docker compose version &>/dev/null || err "Docker Compose no disponible"

    # Verificar si se debe ejecutar setup-server.sh
    if ! docker network inspect joinly-internal &>/dev/null; then
        info "Red de Docker no encontrada, ejecutando setup-server.sh..."
        if [ -f "scripts/setup-server.sh" ]; then
            ./scripts/setup-server.sh
        else
            warn "setup-server.sh no encontrado, creando red manualmente..."
            docker network create joinly-internal --internal 2>/dev/null || true
        fi
    fi

    # Instalar configuración del sistema si existe
    if [ -f "scripts/install-system-config.sh" ]; then
        info "Instalando configuración del sistema..."
        if [ "$EUID" -eq 0 ]; then
            ./scripts/install-system-config.sh
        else
            warn "Ejecutar con sudo para instalar configuración del sistema: sudo $0"
        fi
    fi

    ok "Servidor preparado"
else
    step "6.1 Preparación del Servidor (omitida)"
    warn "Saltando preparación del servidor"
fi

# =============================================================================
# 6.2 DOCKER BUILD Y PUSH
# =============================================================================
if [ "$SKIP_BUILD" = false ]; then
    step "6.2 Docker Build"

    info "Build de producción..."
    if [ -f "scripts/build-prod.sh" ]; then
        ./scripts/build-prod.sh --all
    else
        err "Script build-prod.sh no encontrado"
    fi

    ok "Build completado"
else
    step "6.2 Docker Build (omitida)"
    warn "Saltando build local"
fi

# =============================================================================
# 6.3 DESPLIEGUE EN PRODUCCIÓN
# =============================================================================
step "6.3 Despliegue en Producción"

info "Desplegando servicios..."
if [ -f "scripts/deploy.sh" ]; then
    ./scripts/deploy.sh --build
else
    err "Script deploy.sh no encontrado"
fi

ok "Servicios desplegados"

# =============================================================================
# 6.4 CONFIGURACIÓN NGINX (SSL)
# =============================================================================
if [ "$SKIP_SSL" = false ]; then
    step "6.4 Configuración Nginx (SSL)"

    info "Verificando configuración SSL..."
    if [ -f "scripts/init-ssl.sh" ]; then
        # Intentar configurar SSL automáticamente
        if ./scripts/init-ssl.sh --auto 2>&1 | grep -q "SSL configurado"; then
            ok "SSL configurado con Let's Encrypt"
        else
            warn "SSL no configurado automáticamente"
            warn "Ejecutar manualmente: ./scripts/init-ssl.sh"
        fi
    else
        warn "Script init-ssl.sh no encontrado"
    fi

    # Verificar que nginx está corriendo
    if docker ps -q -f name=joinly-nginx-prod &>/dev/null; then
        ok "Nginx corriendo"
    else
        err "Nginx no está corriendo"
    fi
else
    step "6.4 Configuración Nginx (omitida)"
    warn "Saltando configuración SSL"
fi

# =============================================================================
# 6.5 VERIFICACIÓN POST-DESPIEGUE
# =============================================================================
if [ "$SKIP_VERIFY" = false ]; then
    step "6.5 Verificación Post-Despliegue"

    if [ "$FULL_VERIFY" = true ]; then
        info "Ejecutando verificación completa..."
        VERIFY_ARGS="--full"
    else
        VERIFY_ARGS=""
    fi

    if [ -f "scripts/verify-deploy.sh" ]; then
        ./scripts/verify-deploy.sh $VERIFY_ARGS
    else
        warn "Script verify-deploy.sh no encontrado, ejecutando health-check.sh..."
        if [ -f "scripts/health-check.sh" ]; then
            ./scripts/health-check.sh
        fi
    fi
else
    step "6.5 Verificación Post-Despliegue (omitida)"
    warn "Saltando verificación"
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================
step "RESUMEN FINAL"

echo ""
echo -e "${GREEN}✓ DESPLIEGUE EN PRODUCCIÓN COMPLETADO${NC}"
echo ""
echo "  🌐 URL: https://${DOMAIN}"
echo "  📊 Status: docker compose -f ${COMPOSE_FILE} ps"
echo "  📝 Logs: docker compose -f ${COMPOSE_FILE} logs -f"
echo ""
echo "  Comandos útiles:"
echo "    - Verificar: ${YELLOW}./scripts/health-check.sh${NC}"
echo "    - Verificar completo: ${YELLOW}./scripts/verify-deploy.sh --full${NC}"
echo "    - Backup: ${YELLOW}./scripts/backup.sh${NC}"
echo "    - Rotar logs: ${YELLOW}./scripts/rotate-logs.sh${NC}"
echo "    - Rollback: ${YELLOW}./scripts/rollback.sh${NC}"
echo ""

exit 0
