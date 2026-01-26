#!/usr/bin/env bash
# =============================================================================
# Joinly - Post-Deployment Verification Script
# =============================================================================
# Uso: ./scripts/verify-deploy.sh [--full] [--api-only] [--frontend-only]
#
# Este script verifica:
#   6.5.1 Todas las rutas funcionan
#   6.5.2 Llamadas HTTP funcionan
#   6.5.3 Redirects SPA funcionan
#   6.5.4 SSL/TLS está configurado
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
FULL_CHECK=false
API_ONLY=false
FRONTEND_ONLY=false
DOMAIN=""
ERRORS=0

# Verificar dependencias
command -v curl &>/dev/null || err "curl no instalado. Ejecutar: sudo apt install curl"
command -v openssl &>/dev/null || err "openssl no instalado. Ejecutar: sudo apt install openssl"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[✓]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; ERRORS=$((ERRORS + 1)); }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --full) FULL_CHECK=true; shift ;;
        --api-only) API_ONLY=true; shift ;;
        --frontend-only) FRONTEND_ONLY=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --full           Ejecutar verificaciones completas"
            echo "  --api-only       Solo verificar API"
            echo "  --frontend-only  Solo verificar frontend"
            echo "  --help           Mostrar esta ayuda"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║               🔍 POST-DEPLOYMENT VERIFICATION              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Cargar configuración
[ -f "$ENV_FILE" ] && { set -a; source "$ENV_FILE"; set +a; }
DOMAIN="${DOMAIN:-localhost}"

# =============================================================================
# 6.5.1: VERIFICAR RUTAS FRONTEND
# =============================================================================
if [ "$API_ONLY" = false ]; then
    info "6.5.1: Verificando rutas del frontend..."
    echo ""

    BASE_URL="https://${DOMAIN}"

    # Lista de rutas críticas
    ROUTES=(
        "/"
        "/auth/login"
        "/auth/register"
        "/dashboard"
        "/unirse-grupo"
        "/crear-grupo"
    )

    for route in "${ROUTES[@]}"; do
        STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE_URL}${route}" --connect-timeout 10)
        if [ "$STATUS" = "200" ]; then
            ok "  ${BASE_URL}${route} → 200 OK"
        elif [ "$STATUS" = "302" ] || [ "$STATUS" = "301" ]; then
            ok "  ${BASE_URL}${route} → ${STATUS} Redirect"
        elif [ "$STATUS" = "404" ]; then
            fail "  ${BASE_URL}${route} → 404 Not Found"
        else
            fail "  ${BASE_URL}${route} → ${STATUS}"
        fi
    done

    # Verificar 404
    STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE_URL}/pagina-que-no-existe" --connect-timeout 10)
    if [ "$STATUS" = "200" ]; then
        ok "  ${BASE_URL}/pagina-que-no-existe → 200 OK (SPA fallback)"
    elif [ "$STATUS" = "404" ]; then
        fail "  ${BASE_URL}/pagina-que-no-existe → 404 (fallo en SPA fallback)"
    else
        warn "  ${BASE_URL}/pagina-que-no-existe → ${STATUS}"
    fi

    echo ""
fi

# =============================================================================
# 6.5.2: VERIFICAR LLAMADAS HTTP (API)
# =============================================================================
if [ "$FRONTEND_ONLY" = false ]; then
    info "6.5.2: Verificando llamadas HTTP a la API..."
    echo ""

    API_URL="https://${DOMAIN}/api/v1"

    # Health check
    STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://${DOMAIN}/actuator/health" --connect-timeout 10)
    if [ "$STATUS" = "200" ]; then
        ok "  /actuator/health → 200 OK"
    else
        fail "  /actuator/health → ${STATUS}"
    fi

    # Login endpoint (verificar que responde, aunque sea error 401 sin auth)
    STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "${API_URL}/auth/login" -X POST -H "Content-Type: application/json" --connect-timeout 10)
    if [ "$STATUS" = "400" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "405" ]; then
        ok "  POST /api/v1/auth/login → ${STATUS} (endpoint activo)"
    elif [ "$STATUS" = "200" ]; then
        ok "  POST /api/v1/auth/login → 200 OK"
    else
        fail "  POST /api/v1/auth/login → ${STATUS}"
    fi

    # Unidades endpoint (requiere auth, verificar que sea 401)
    STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "${API_URL}/unidades" --connect-timeout 10)
    if [ "$STATUS" = "401" ]; then
        ok "  GET /api/v1/unidades → 401 Unauthorized (auth funcionando)"
    else
        warn "  GET /api/v1/unidades → ${STATUS}"
    fi

    # Verificar CORS
    CORS_ORIGIN=$(curl -sk -I "${API_URL}/auth/login" 2>/dev/null | grep -i "access-control-allow-origin" | cut -d: -f2 | tr -d '\r' || echo "")
    if [ -n "$CORS_ORIGIN" ]; then
        ok "  CORS header presente: $CORS_ORIGIN"
    else
        warn "  CORS header no encontrado"
    fi

    echo ""
fi

# =============================================================================
# 6.5.3: VERIFICAR REDIRECTS SPA
# =============================================================================
if [ "$API_ONLY" = false ]; then
    info "6.5.3: Verificando redirects SPA (deep links)..."
    echo ""

    DEEP_LINKS=(
        "/dashboard"
        "/unirse-grupo"
        "/crear-grupo"
        "/grupo/123"
        "/suscripcion/456"
    )

    for link in "${DEEP_LINKS[@]}"; do
        # Verificar que devuelva el index.html (200 OK)
        STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE_URL}${link}" --connect-timeout 10)
        if [ "$STATUS" = "200" ]; then
            ok "  ${BASE_URL}${link} → 200 OK (SPA fallback)"
        else
            fail "  ${BASE_URL}${link} → ${STATUS}"
        fi
    done

    echo ""
fi

# =============================================================================
# 6.5.4: VERIFICAR SSL/TLS
# =============================================================================
info "6.5.4: Verificando SSL/TLS..."
echo ""

# Verificar que HTTPS funcione
STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE_URL}" --connect-timeout 10)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
    ok "  HTTPS funcionando → ${STATUS}"
else
    fail "  HTTPS no funciona → ${STATUS}"
fi

# Verificar certificado SSL
CERT_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")

if [ -n "$CERT_EXPIRY" ]; then
    ok "  Certificado SSL válido hasta: $CERT_EXPIRY"

    # Calcular días restantes
    EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

    if [ $DAYS_LEFT -gt 30 ]; then
        ok "  Días restantes: $DAYS_LEFT"
    elif [ $DAYS_LEFT -gt 0 ]; then
        warn "  Días restantes: $DAYS_LEFT (renovar pronto)"
    else
        fail "  Días restantes: $DAYS_LEFT (certificado expirado)"
    fi
else
    fail "  No se pudo obtener información del certificado"
fi

# Verificar redirect HTTP → HTTPS
HTTP_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "http://${DOMAIN}" --connect-timeout 10)
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    ok "  HTTP → HTTPS redirect funciona → ${HTTP_STATUS}"
else
    fail "  HTTP → HTTPS redirect no funciona → ${HTTP_STATUS}"
fi

echo ""

# =============================================================================
# VERIFICACIONES ADICIONALES (si --full)
# =============================================================================
if [ "$FULL_CHECK" = true ]; then
    info "Verificaciones adicionales..."
    echo ""

    # Verificar security headers
    SECURITY_HEADERS=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "Strict-Transport-Security"
        "X-XSS-Protection"
    )

    for header in "${SECURITY_HEADERS[@]}"; do
        HEADER_VALUE=$(curl -sk -I "${BASE_URL}" 2>/dev/null | grep -i "^$header:" | cut -d: -f2 | tr -d '\r' || echo "")
        if [ -n "$HEADER_VALUE" ]; then
            ok "  $header: $HEADER_VALUE"
        else
            warn "  $header: no presente"
        fi
    done

    # Verificar gzip
    ENCODING=$(curl -sk -I -H "Accept-Encoding: gzip" "${BASE_URL}" 2>/dev/null | grep -i "content-encoding" | cut -d: -f2 | tr -d '\r' || echo "")
    if [ -n "$ENCODING" ]; then
        ok "  Compresión gzip activa: $ENCODING"
    else
        warn "  Compresión gzip no detectada"
    fi

    # Verificar contenedores
    info "Verificando contenedores Docker..."
    for container in joinly-mysql-prod joinly-backend-prod joinly-nginx-prod; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "running")
            ok "  $container: $STATUS"
        else
            fail "  $container: no está corriendo"
        fi
    done

    echo ""
fi

# =============================================================================
# RESUMEN
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}           ✓ TODAS LAS VERIFICACIONES PASARON${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  🌐 URL: ${GREEN}https://$DOMAIN${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}           ✗ $ERRORS VERIFICACION(ES) FALLÓ/FALLARON${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${RED}Hay problemas con el despliegue${NC}"
    echo -e "  Revisa los logs: ${YELLOW}docker compose -f docker-compose.prod.yml logs${NC}"
    echo ""
    exit 1
fi
