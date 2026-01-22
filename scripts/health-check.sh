#!/usr/bin/env bash
# =============================================================================
# Joinly - Health Check Script
# =============================================================================
# Uso: ./scripts/health-check.sh [--json] [--quiet]
#
# Verifica el estado de todos los servicios:
#   - Contenedores Docker
#   - Base de datos MySQL
#   - Backend API
#   - Nginx/HTTPS
#   - Certificados SSL
# =============================================================================

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
JSON=false
QUIET=false
ERRORS=0
JSON_OUTPUT=""

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --json) JSON=true; shift ;;
        --quiet|-q) QUIET=true; shift ;;
        --help|-h)
            echo "Uso: $0 [--json] [--quiet]"
            echo ""
            echo "Opciones:"
            echo "  --json    Salida en formato JSON"
            echo "  --quiet   Solo código de salida (0=OK, 1=ERROR)"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Cargar variables
[ -f "$ENV_FILE" ] && { set -a; source "$ENV_FILE"; set +a; }
DOMAIN="${DOMAIN:-localhost}"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funciones
add_check() {
    local name="$1" status="$2"
    [ -n "$JSON_OUTPUT" ] && JSON_OUTPUT="$JSON_OUTPUT,"
    JSON_OUTPUT="$JSON_OUTPUT\"$name\":\"$status\""
}

print_section() {
    [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}$1:${NC}"
}

check_pass() {
    add_check "$1" "OK"
    [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "  ${GREEN}✓${NC} $1"
}

check_fail() {
    add_check "$1" "FAIL"
    ERRORS=$((ERRORS + 1))
    [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "  ${RED}✗${NC} $1: $2"
}

check_warn() {
    add_check "$1" "WARN"
    [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "  ${YELLOW}⚠${NC} $1: $2"
}

# Banner
if [ "$JSON" = false ] && [ "$QUIET" = false ]; then
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   🏥 HEALTH CHECK                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
fi

# =============================================================================
# VERIFICACIONES
# =============================================================================

# 1. Docker
print_section "Docker"
if docker info &>/dev/null; then
    check_pass "Docker daemon"
else
    check_fail "Docker daemon" "No está corriendo"
fi

# 2. Contenedores
print_section "Contenedores"
for container in joinly-mysql-prod joinly-backend-prod joinly-nginx-prod; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "running")
        if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "running" ]; then
            check_pass "$container"
        else
            check_warn "$container" "$STATUS"
        fi
    else
        check_fail "$container" "No está corriendo"
    fi
done

# 3. MySQL
print_section "Base de datos"
if docker exec joinly-mysql-prod mysqladmin ping -h localhost --silent &>/dev/null; then
    check_pass "MySQL ping"
else
    check_fail "MySQL ping" "No responde"
fi

# 4. Backend API
print_section "Backend API"
if docker exec joinly-backend-prod curl -sf http://localhost:8080/actuator/health &>/dev/null; then
    check_pass "Actuator health"
else
    check_fail "Actuator health" "No responde"
fi

# 5. Nginx
print_section "Nginx"
if docker exec joinly-nginx-prod curl -sf http://localhost/nginx-health &>/dev/null; then
    check_pass "Nginx health"
else
    check_fail "Nginx health" "No responde"
fi

# 6. HTTPS externo
print_section "Acceso externo"
if curl -sf "https://${DOMAIN}/nginx-health" --connect-timeout 5 &>/dev/null; then
    check_pass "HTTPS ($DOMAIN)"
else
    if curl -skf "https://${DOMAIN}/nginx-health" --connect-timeout 5 &>/dev/null; then
        check_warn "HTTPS ($DOMAIN)" "Certificado no válido"
    else
        check_fail "HTTPS ($DOMAIN)" "No accesible"
    fi
fi

# 7. SSL
print_section "Certificado SSL"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if docker exec joinly-nginx-prod test -f "$CERT_PATH" 2>/dev/null; then
    EXPIRY=$(docker exec joinly-nginx-prod openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2 || echo "")
    if [ -n "$EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo 0)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            check_pass "Let's Encrypt (${DAYS_LEFT} días)"
        elif [ $DAYS_LEFT -gt 0 ]; then
            check_warn "Let's Encrypt" "Expira en ${DAYS_LEFT} días"
        else
            check_fail "Let's Encrypt" "Expirado"
        fi
    else
        check_pass "Let's Encrypt"
    fi
else
    check_warn "SSL" "Usando certificado autofirmado"
fi

# =============================================================================
# RESULTADO
# =============================================================================

if [ "$JSON" = true ]; then
    STATUS="OK"
    [ $ERRORS -gt 0 ] && STATUS="ERROR"
    echo "{"
    echo "  \"status\": \"$STATUS\","
    echo "  \"domain\": \"$DOMAIN\","
    echo "  \"errors\": $ERRORS,"
    echo "  \"checks\": {$JSON_OUTPUT}"
    echo "}"
elif [ "$QUIET" = false ]; then
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}           ✓ Todos los servicios funcionando${NC}"
    else
        echo -e "${RED}           ✗ $ERRORS servicio(s) con problemas${NC}"
    fi
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
fi

exit $ERRORS
