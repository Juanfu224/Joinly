#!/usr/bin/env bash
# =============================================================================
# Joinly - Deploy Script (Automatizado con SSL)
# =============================================================================
# Uso: ./scripts/deploy.sh [--build] [--skip-ssl] [--logs]
#
# Este script realiza TODO el proceso de despliegue automáticamente:
#   1. Verifica dependencias (Docker, git)
#   2. Valida configuración
#   3. Crea backup pre-deploy (si existe BD)
#   4. Despliega servicios con Docker Compose
#   5. Espera health checks
#   6. Configura SSL con Let's Encrypt automáticamente
#   7. Verifica funcionamiento post-deploy
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="$(pwd)"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BUILD=""
SKIP_SSL=false
LOGS=false
MAX_WAIT=120

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}══════════════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"; }

# Banner
clear 2>/dev/null || true
echo -e "${BLUE}"
cat << 'EOF'
     ╔═══════════════════════════════════════════════════════════╗
     ║     ██╗ ██████╗ ██╗███╗   ██╗██╗  ██╗   ██╗              ║
     ║     ██║██╔═══██╗██║████╗  ██║██║  ╚██╗ ██╔╝              ║
     ║     ██║██║   ██║██║██╔██╗ ██║██║   ╚████╔╝               ║
     ║██   ██║██║   ██║██║██║╚██╗██║██║    ╚██╔╝                ║
     ║╚█████╔╝╚██████╔╝██║██║ ╚████║███████╗██║                 ║
     ║ ╚════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝                 ║
     ║                                                           ║
     ║              🚀 PRODUCTION DEPLOYMENT                     ║
     ╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --build) BUILD="--build"; shift ;;
        --skip-ssl) SKIP_SSL=true; shift ;;
        --logs) LOGS=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --build      Reconstruir imágenes Docker"
            echo "  --skip-ssl   No configurar SSL (usar certificados existentes)"
            echo "  --logs       Mostrar logs después del deploy"
            echo "  --help       Mostrar esta ayuda"
            exit 0
            ;;
        *) shift ;;
    esac
done

# =============================================================================
# PASO 1: VERIFICAR DEPENDENCIAS
# =============================================================================
step "1/7 Verificando dependencias"

command -v docker &>/dev/null || err "Docker no instalado. Ejecutar: curl -fsSL https://get.docker.com | sh"
command -v git &>/dev/null || err "Git no instalado"
docker compose version &>/dev/null || err "Docker Compose no disponible"
docker info &>/dev/null || err "Docker daemon no está corriendo"

ok "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
ok "Docker Compose $(docker compose version --short)"

# =============================================================================
# PASO 2: VERIFICAR CONFIGURACIÓN
# =============================================================================
step "2/7 Validando configuración"

[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado. Copiar desde .env.prod.example"
[ ! -f ".env" ] && ln -sf .env.prod .env

set -a; source "$ENV_FILE"; set +a

# Validaciones críticas
[[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]] && err "DOMAIN no configurado en $ENV_FILE"
[[ -z "${JWT_SECRET_KEY:-}" || "$JWT_SECRET_KEY" == *"GENERAR"* ]] && err "JWT_SECRET_KEY no configurado"
[[ -z "${MYSQL_ROOT_PASSWORD:-}" || "$MYSQL_ROOT_PASSWORD" == *"GENERAR"* ]] && err "MYSQL_ROOT_PASSWORD no configurado"
[[ -z "${ENCRYPTION_KEY:-}" || "$ENCRYPTION_KEY" == *"GENERAR"* ]] && err "ENCRYPTION_KEY no configurado"
[[ -z "${LETSENCRYPT_EMAIL:-}" || "$LETSENCRYPT_EMAIL" == *"example"* ]] && err "LETSENCRYPT_EMAIL no configurado"

ok "Dominio: $DOMAIN"
ok "Email SSL: $LETSENCRYPT_EMAIL"
ok "Variables de seguridad configuradas"

# =============================================================================
# PASO 3: BACKUP PRE-DEPLOY
# =============================================================================
step "3/7 Backup pre-deploy"

if docker ps -q -f name=joinly-mysql-prod &>/dev/null 2>&1; then
    mkdir -p backups
    BACKUP_FILE="backups/pre_deploy_$(date +%Y%m%d_%H%M%S).sql.gz"
    if docker exec joinly-mysql-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
        --single-transaction --quick "$MYSQL_DATABASE" 2>/dev/null | gzip > "$BACKUP_FILE"; then
        ok "Backup creado: $BACKUP_FILE"
        # Mantener solo los últimos 5 backups
        ls -t backups/pre_deploy_*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
    else
        warn "No se pudo crear backup (DB nueva o vacía)"
        rm -f "$BACKUP_FILE"
    fi
else
    info "Primera instalación - sin backup previo"
fi

# =============================================================================
# PASO 4: GENERAR CERTIFICADOS SSL TEMPORALES
# =============================================================================
step "4/7 Preparando certificados SSL"

mkdir -p ssl
if [ ! -f "ssl/nginx.crt" ]; then
    info "Generando certificados SSL temporales..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/nginx.key -out ssl/nginx.crt \
        -subj "/CN=${DOMAIN}/O=Joinly/C=ES" 2>/dev/null
    chmod 644 ssl/nginx.crt ssl/nginx.key
    ok "Certificados temporales generados"
else
    ok "Certificados SSL existentes"
fi

# =============================================================================
# PASO 5: DESPLEGAR SERVICIOS
# =============================================================================
step "5/7 Desplegando servicios Docker"

info "Descargando imágenes base..."
docker compose -f "$COMPOSE_FILE" pull mysql certbot 2>/dev/null || true

info "Iniciando servicios..."
if ! docker compose -f "$COMPOSE_FILE" up -d $BUILD 2>&1; then
    err "Error durante el despliegue. Ver: docker compose -f $COMPOSE_FILE logs"
fi

# Función para esperar health checks
wait_for_healthy() {
    local service=$1 max_wait=$2 waited=0
    while [ $waited -lt $max_wait ]; do
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "starting")
        [ "$STATUS" = "healthy" ] && return 0
        [ "$STATUS" = "unhealthy" ] && return 1
        sleep 3
        waited=$((waited + 3))
        printf "."
    done
    return 1
}

echo ""
echo -n "  Esperando MySQL"
wait_for_healthy "joinly-mysql-prod" 90 && echo -e " ${GREEN}✓${NC}" || { echo -e " ${RED}✗${NC}"; err "MySQL no está healthy"; }

echo -n "  Esperando Backend"
wait_for_healthy "joinly-backend-prod" "$MAX_WAIT" && echo -e " ${GREEN}✓${NC}" || { echo -e " ${RED}✗${NC}"; err "Backend no está healthy"; }

echo -n "  Esperando Nginx"
wait_for_healthy "joinly-nginx-prod" 60 && echo -e " ${GREEN}✓${NC}" || { echo -e " ${RED}✗${NC}"; err "Nginx no está healthy"; }

ok "Todos los servicios están healthy"

# =============================================================================
# PASO 6: CONFIGURAR SSL CON LET'S ENCRYPT
# =============================================================================
step "6/7 Configurando SSL con Let's Encrypt"

if [ "$SKIP_SSL" = true ]; then
    warn "SSL omitido (--skip-ssl)"
else
    # Verificar si ya tenemos certificado válido de Let's Encrypt
    CERT_VOLUME_PATH=$(docker volume inspect joinly-certbot-conf --format '{{.Mountpoint}}' 2>/dev/null || echo "")
    HAS_VALID_CERT=false
    
    if [ -n "$CERT_VOLUME_PATH" ] && [ -f "$CERT_VOLUME_PATH/live/$DOMAIN/fullchain.pem" ]; then
        # Verificar si el certificado es válido y no está por expirar (>7 días)
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_VOLUME_PATH/live/$DOMAIN/fullchain.pem" 2>/dev/null | cut -d= -f2 || echo "")
        if [ -n "$EXPIRY_DATE" ]; then
            EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || echo "0")
            NOW_EPOCH=$(date +%s)
            DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
            if [ "$DAYS_LEFT" -gt 7 ]; then
                HAS_VALID_CERT=true
                ok "Certificado Let's Encrypt válido (expira en $DAYS_LEFT días)"
            fi
        fi
    fi
    
    if [ "$HAS_VALID_CERT" = false ]; then
        info "Obteniendo certificado de Let's Encrypt..."
        
        # Verificar que el dominio apunta a este servidor
        SERVER_IP=$(curl -sf --max-time 5 https://api.ipify.org 2>/dev/null || curl -sf --max-time 5 https://ifconfig.me 2>/dev/null || echo "")
        DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | head -1 || getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1}' || echo "")
        
        if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ] && [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
            warn "DNS: $DOMAIN ($DOMAIN_IP) no apunta a este servidor ($SERVER_IP)"
            warn "Continuando de todos modos..."
        elif [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ]; then
            ok "DNS correcto: $DOMAIN → $SERVER_IP"
        fi
        
        # Detener nginx temporalmente para usar certbot standalone
        info "Deteniendo nginx para obtener certificado..."
        docker compose -f "$COMPOSE_FILE" stop nginx 2>/dev/null || true
        sleep 2
        
        # Obtener el path del volumen certbot
        CERT_VOLUME_PATH=$(docker volume inspect joinly-certbot-conf --format '{{.Mountpoint}}' 2>/dev/null || echo "/var/lib/docker/volumes/joinly-certbot-conf/_data")
        
        # Ejecutar certbot en modo standalone
        if docker run --rm \
            -v "$CERT_VOLUME_PATH:/etc/letsencrypt" \
            -p 80:80 -p 443:443 \
            certbot/certbot:latest certonly \
            --standalone \
            --non-interactive \
            --agree-tos \
            --email "$LETSENCRYPT_EMAIL" \
            -d "$DOMAIN" \
            -d "www.$DOMAIN" 2>&1; then
            ok "Certificado Let's Encrypt obtenido"
        else
            warn "No se pudo obtener certificado Let's Encrypt"
            warn "Usando certificados autofirmados temporales"
        fi
        
        # Reiniciar nginx
        info "Reiniciando nginx..."
        docker compose -f "$COMPOSE_FILE" up -d nginx certbot
        sleep 3
        
        # Esperar a que nginx esté healthy de nuevo
        echo -n "  Esperando Nginx"
        wait_for_healthy "joinly-nginx-prod" 30 && echo -e " ${GREEN}✓${NC}" || warn "Nginx tardando en iniciar"
    fi
fi

# =============================================================================
# PASO 7: VERIFICACIÓN FINAL
# =============================================================================
step "7/7 Verificación final"

sleep 2

# Health check interno
if docker exec joinly-nginx-prod curl -sf http://localhost/nginx-health &>/dev/null; then
    ok "Health check interno"
else
    warn "Health check interno fallido"
fi

# Verificar HTTPS
HTTPS_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://${DOMAIN}/" 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    ok "HTTPS funcionando (HTTP $HTTPS_STATUS)"
else
    warn "HTTPS responde con HTTP $HTTPS_STATUS"
fi

# Verificar certificado SSL
SSL_ISSUER=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN":443 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null | grep -o "Let's Encrypt\|Joinly" || echo "Desconocido")
SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN":443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "N/A")

if [[ "$SSL_ISSUER" == *"Let's Encrypt"* ]]; then
    ok "SSL: Let's Encrypt (expira: $SSL_EXPIRY)"
else
    warn "SSL: Certificado autofirmado"
fi

# Verificar API
API_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://${DOMAIN}/actuator/health" 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
    ok "API Backend funcionando"
else
    warn "API Backend responde con HTTP $API_STATUS"
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 ${CYAN}URL:${NC} https://$DOMAIN"
echo -e "  🔐 ${CYAN}SSL:${NC} $SSL_ISSUER"
echo ""

# Mostrar estado de contenedores
echo -e "${BLUE}  Estado de servicios:${NC}"
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null | grep -E "(NAME|joinly)" | sed 's/^/  /'

echo ""
echo -e "  ${YELLOW}Comandos útiles:${NC}"
echo -e "    Ver logs:     docker compose -f $COMPOSE_FILE logs -f"
echo -e "    Reiniciar:    docker compose -f $COMPOSE_FILE restart"
echo -e "    Estado:       docker compose -f $COMPOSE_FILE ps"
echo -e "    Verificar:    ./scripts/verify-deploy.sh --full"
echo ""

[ "$LOGS" = true ] && docker compose -f "$COMPOSE_FILE" logs -f

exit 0
