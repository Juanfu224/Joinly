#!/usr/bin/env bash
# =============================================================================
# Joinly - Let's Encrypt SSL Setup
# =============================================================================
# Uso: ./scripts/init-ssl.sh [--renew] [--staging]
#
# Este script obtiene/renueva certificados SSL de Let's Encrypt.
# Se ejecuta automáticamente como parte de deploy.sh, pero puede
# usarse de forma independiente para renovar certificados.
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
RENEW=false
STAGING=false

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --renew) RENEW=true; shift ;;
        --staging) STAGING=true; shift ;;
        --help|-h)
            echo "Uso: $0 [--renew] [--staging]"
            echo ""
            echo "Opciones:"
            echo "  --renew     Forzar renovación del certificado"
            echo "  --staging   Usar servidor staging de Let's Encrypt (para pruebas)"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║               🔐 SSL Let's Encrypt Setup                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar configuración
[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado"
set -a; source "$ENV_FILE"; set +a

[[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]] && err "DOMAIN no configurado en $ENV_FILE"
[[ -z "${LETSENCRYPT_EMAIL:-}" || "$LETSENCRYPT_EMAIL" == *"example"* ]] && err "LETSENCRYPT_EMAIL no configurado en $ENV_FILE"

echo "  Dominio: $DOMAIN"
echo "  Email:   $LETSENCRYPT_EMAIL"
echo ""

# =============================================================================
# VERIFICAR CERTIFICADO EXISTENTE
# =============================================================================
CERT_VOLUME_PATH=$(docker volume inspect joinly-certbot-conf --format '{{.Mountpoint}}' 2>/dev/null || echo "")
NEED_NEW_CERT=true

if [ -n "$CERT_VOLUME_PATH" ] && [ -f "$CERT_VOLUME_PATH/live/$DOMAIN/fullchain.pem" ]; then
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_VOLUME_PATH/live/$DOMAIN/fullchain.pem" 2>/dev/null | cut -d= -f2 || echo "")
    if [ -n "$EXPIRY_DATE" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || echo "0")
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
        
        if [ "$DAYS_LEFT" -gt 30 ] && [ "$RENEW" = false ]; then
            ok "Certificado válido (expira en $DAYS_LEFT días)"
            ok "Usa --renew para forzar renovación"
            exit 0
        elif [ "$DAYS_LEFT" -gt 7 ]; then
            info "Certificado expira en $DAYS_LEFT días"
        else
            warn "Certificado expira en $DAYS_LEFT días - renovación necesaria"
        fi
    fi
fi

# =============================================================================
# VERIFICAR DNS
# =============================================================================
info "Verificando DNS..."

SERVER_IP=$(curl -sf --max-time 5 https://api.ipify.org 2>/dev/null || curl -sf --max-time 5 https://ifconfig.me 2>/dev/null || echo "")
DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | head -1 || getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1}' || echo "")

if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ]; then
    if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
        warn "El dominio ($DOMAIN_IP) no apunta a este servidor ($SERVER_IP)"
        warn "El certificado podría fallar"
    else
        ok "DNS correcto: $DOMAIN → $SERVER_IP"
    fi
fi

# =============================================================================
# OBTENER CERTIFICADO
# =============================================================================
info "Obteniendo certificado de Let's Encrypt..."

# Detener nginx temporalmente
NGINX_RUNNING=false
if docker ps -q -f name=joinly-nginx-prod &>/dev/null; then
    NGINX_RUNNING=true
    info "Deteniendo nginx temporalmente..."
    docker compose -f "$COMPOSE_FILE" stop nginx 2>/dev/null || true
    sleep 2
fi

# Obtener el path del volumen
CERT_VOLUME_PATH=$(docker volume inspect joinly-certbot-conf --format '{{.Mountpoint}}' 2>/dev/null)
if [ -z "$CERT_VOLUME_PATH" ]; then
    # Crear el volumen si no existe
    docker volume create joinly-certbot-conf >/dev/null
    CERT_VOLUME_PATH=$(docker volume inspect joinly-certbot-conf --format '{{.Mountpoint}}')
fi

# Construir argumentos de certbot
CERTBOT_ARGS="certonly --standalone --non-interactive --agree-tos"
CERTBOT_ARGS="$CERTBOT_ARGS --email $LETSENCRYPT_EMAIL"
CERTBOT_ARGS="$CERTBOT_ARGS -d $DOMAIN -d www.$DOMAIN"

[ "$STAGING" = true ] && CERTBOT_ARGS="$CERTBOT_ARGS --staging"
[ "$RENEW" = true ] && CERTBOT_ARGS="$CERTBOT_ARGS --force-renewal"

# Ejecutar certbot
if docker run --rm \
    -v "$CERT_VOLUME_PATH:/etc/letsencrypt" \
    -p 80:80 -p 443:443 \
    certbot/certbot:latest $CERTBOT_ARGS; then
    ok "Certificado obtenido exitosamente"
else
    err "Error obteniendo certificado. Verificar DNS y que el puerto 80 esté accesible."
fi

# =============================================================================
# REINICIAR NGINX
# =============================================================================
if [ "$NGINX_RUNNING" = true ]; then
    info "Reiniciando nginx..."
    docker compose -f "$COMPOSE_FILE" up -d nginx
    sleep 3
fi

# =============================================================================
# VERIFICAR HTTPS
# =============================================================================
info "Verificando HTTPS..."

sleep 2
if curl -sf "https://${DOMAIN}/nginx-health" &>/dev/null; then
    ok "HTTPS funcionando correctamente"
elif curl -skf "https://${DOMAIN}/" &>/dev/null; then
    ok "HTTPS funcionando"
else
    warn "HTTPS podría tardar unos segundos en estar disponible"
fi

# =============================================================================
# RESUMEN
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✓ SSL CONFIGURADO CORRECTAMENTE${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  🌐 URL: https://$DOMAIN"
echo "  📅 Renovación automática: Cada 12 horas (via certbot container)"
echo ""
echo "  Comandos útiles:"
echo "    - Ver certificados: docker exec joinly-certbot certbot certificates"
echo "    - Renovar manual:   $0 --renew"
echo ""
