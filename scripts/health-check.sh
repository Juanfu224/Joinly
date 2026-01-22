#!/usr/bin/env bash
# =============================================================================
# Joinly - Health Check Script
# =============================================================================
# Uso: ./scripts/health-check.sh [--json] [--quiet]
#
# Verifica el estado completo de todos los servicios:
#   - Contenedores Docker
#   - Base de datos MySQL
#   - Backend API
#   - Nginx/HTTPS
#   - Certificados SSL
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
JSON=false
QUIET=false
EXIT_CODE=0

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

# Colores (solo si no es JSON ni quiet)
if [ "$JSON" = false ] && [ "$QUIET" = false ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' NC=''
fi

# Funciones de salida
declare -A RESULTS

check_pass() { RESULTS["$1"]="OK"; [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "  ${GREEN}✓${NC} $1"; }
check_fail() { RESULTS["$1"]="FAIL"; EXIT_CODE=1; [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "  ${RED}✗${NC} $1: $2"; }
check_warn() { RESULTS["$1"]="WARN"; [ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "  ${YELLOW}⚠${NC} $1: $2"; }

# =============================================================================
# VERIFICACIONES
# =============================================================================

if [ "$JSON" = false ] && [ "$QUIET" = false ]; then
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   🏥 HEALTH CHECK                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
fi

# 1. Docker
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Docker:${NC}"
if docker info &>/dev/null; then
    check_pass "Docker daemon"
else
    check_fail "Docker daemon" "No está corriendo"
fi

# 2. Contenedores
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Contenedores:${NC}"
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
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Base de datos:${NC}"
if docker exec joinly-mysql-prod mysqladmin ping -h localhost --silent &>/dev/null; then
    check_pass "MySQL ping"
else
    check_fail "MySQL ping" "No responde"
fi

# 4. Backend API
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Backend API:${NC}"
if docker exec joinly-backend-prod curl -sf http://localhost:8080/actuator/health &>/dev/null; then
    check_pass "Actuator health"
else
    check_fail "Actuator health" "No responde"
fi

# 5. Nginx
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Nginx:${NC}"
if docker exec joinly-nginx-prod curl -sf http://localhost/nginx-health &>/dev/null; then
    check_pass "Nginx health"
else
    check_fail "Nginx health" "No responde"
fi

# 6. HTTPS externo
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Acceso externo:${NC}"
if curl -sf "https://${DOMAIN}/nginx-health" &>/dev/null; then
    check_pass "HTTPS ($DOMAIN)"
else
    if curl -skf "https://${DOMAIN}/nginx-health" &>/dev/null; then
        check_warn "HTTPS ($DOMAIN)" "Certificado no válido"
    else
        check_fail "HTTPS ($DOMAIN)" "No accesible"
    fi
fi

# 7. SSL
[ "$QUIET" = false ] && [ "$JSON" = false ] && echo -e "\n${BLUE}Certificado SSL:${NC}"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if docker exec joinly-nginx-prod test -f "$CERT_PATH" 2>/dev/null; then
    EXPIRY=$(docker exec joinly-nginx-prod openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2 || echo "")
    if [ -n "$EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo 0)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            check_pass "Let's Encrypt (expira en ${DAYS_LEFT} días)"
        elif [ $DAYS_LEFT -gt 0 ]; then
            check_warn "Let's Encrypt" "Expira en ${DAYS_LEFT} días"
        else
            check_fail "Let's Encrypt" "Certificado expirado"
        fi
    else
        check_pass "Let's Encrypt"
    fi
else
    check_warn "Let's Encrypt" "Usando certificado autofirmado"
fi

# =============================================================================
# RESULTADO
# =============================================================================

if [ "$JSON" = true ]; then
    echo "{"
    echo "  \"status\": \"$([ $EXIT_CODE -eq 0 ] && echo 'OK' || echo 'ERROR')\","
    echo "  \"domain\": \"$DOMAIN\","
    echo "  \"checks\": {"
    first=true
    for key in "${!RESULTS[@]}"; do
        [ "$first" = false ] && echo ","
        echo -n "    \"$key\": \"${RESULTS[$key]}\""
        first=false
    done
    echo ""
    echo "  }"
    echo "}"
elif [ "$QUIET" = false ]; then
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}           ✓ Todos los servicios funcionando${NC}"
    else
        echo -e "${RED}           ✗ Algunos servicios tienen problemas${NC}"
    fi
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
fi

exit $EXIT_CODE
