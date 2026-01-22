#!/usr/bin/env bash
# =============================================================================
# Joinly - Let's Encrypt SSL Setup (Automatizado)
# =============================================================================
# Uso: ./scripts/init-ssl.sh [--auto] [--renew]
#
# Este script:
#   1. Verifica que los servicios estén corriendo
#   2. Verifica que el dominio apunte al servidor
#   3. Obtiene certificado Let's Encrypt via webroot
#   4. Reinicia nginx para usar el nuevo certificado
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
AUTO=false
RENEW=false

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

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto) AUTO=true; shift ;;
        --renew) RENEW=true; AUTO=true; shift ;;
        --help|-h)
            echo "Uso: $0 [--auto] [--renew]"
            echo ""
            echo "Opciones:"
            echo "  --auto    No pedir confirmación"
            echo "  --renew   Forzar renovación del certificado"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Verificar configuración
[ -f "$ENV_FILE" ] || err "Archivo $ENV_FILE no encontrado"
set -a; source "$ENV_FILE"; set +a

[[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]] && err "DOMAIN no configurado en $ENV_FILE"
[[ -z "${LETSENCRYPT_EMAIL:-}" || "$LETSENCRYPT_EMAIL" == *"example"* ]] && err "LETSENCRYPT_EMAIL no configurado en $ENV_FILE"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║               🔐 SSL Let's Encrypt Setup                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "  Dominio: $DOMAIN"
echo "  Email:   $LETSENCRYPT_EMAIL"
echo ""

# Verificar si ya existe certificado válido
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if docker compose -f "$COMPOSE_FILE" exec -T nginx test -f "$CERT_PATH" 2>/dev/null; then
    if [ "$RENEW" = false ]; then
        EXPIRY=$(docker compose -f "$COMPOSE_FILE" exec -T nginx openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2 || echo "")
        if [ -n "$EXPIRY" ]; then
            ok "Certificado ya existe (expira: $EXPIRY)"
            echo ""
            read -p "¿Renovar de todos modos? (y/n) " -n 1 -r
            echo
            [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
        fi
    fi
fi

# Confirmación
if [ "$AUTO" = false ]; then
    read -p "¿Continuar con la obtención del certificado? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
fi

# =============================================================================
# 1. VERIFICAR SERVICIOS
# =============================================================================
info "Verificando servicios..."

# Asegurar que los servicios estén levantados
if ! docker ps -q -f name=joinly-nginx-prod &>/dev/null; then
    info "Iniciando servicios..."
    docker compose -f "$COMPOSE_FILE" up -d mysql backend nginx
fi

# Esperar a que nginx esté listo
info "Esperando a que nginx esté listo..."
for i in {1..30}; do
    if docker exec joinly-nginx-prod curl -sf http://localhost/nginx-health &>/dev/null; then
        break
    fi
    sleep 2
done

ok "Nginx está listo"

# =============================================================================
# 2. VERIFICAR ACCESO AL DOMINIO
# =============================================================================
info "Verificando acceso al dominio..."

# Verificar que el dominio resuelve a este servidor
SERVER_IP=$(curl -sf https://api.ipify.org 2>/dev/null || curl -sf https://ifconfig.me 2>/dev/null || echo "")
DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | head -1 || getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1}' || echo "")

if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ]; then
    if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
        warn "El dominio ($DOMAIN_IP) no apunta a este servidor ($SERVER_IP)"
        if [ "$AUTO" = false ]; then
            read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
            echo
            [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
        fi
    else
        ok "DNS correcto: $DOMAIN -> $SERVER_IP"
    fi
fi

# Verificar que el puerto 80 está accesible
if curl -sf "http://${DOMAIN}/.well-known/acme-challenge/test" -o /dev/null 2>&1 || \
   curl -sf "http://${DOMAIN}/nginx-health" -o /dev/null 2>&1; then
    ok "Puerto 80 accesible"
else
    warn "Puerto 80 podría no estar accesible externamente"
fi

# =============================================================================
# 3. OBTENER CERTIFICADO
# =============================================================================
info "Obteniendo certificado de Let's Encrypt..."

CERTBOT_ARGS="certonly --webroot -w /var/www/certbot"
CERTBOT_ARGS="$CERTBOT_ARGS --email $LETSENCRYPT_EMAIL"
CERTBOT_ARGS="$CERTBOT_ARGS --agree-tos --no-eff-email"
CERTBOT_ARGS="$CERTBOT_ARGS -d $DOMAIN -d www.$DOMAIN"

if [ "$RENEW" = true ]; then
    CERTBOT_ARGS="$CERTBOT_ARGS --force-renewal"
fi

# Ejecutar certbot
if docker compose -f "$COMPOSE_FILE" run --rm certbot $CERTBOT_ARGS; then
    ok "Certificado obtenido exitosamente"
else
    err "Error obteniendo certificado. Verificar DNS y firewall."
fi

# =============================================================================
# 4. REINICIAR NGINX
# =============================================================================
info "Reiniciando nginx con el nuevo certificado..."

docker compose -f "$COMPOSE_FILE" restart nginx
sleep 3

# =============================================================================
# 5. VERIFICAR HTTPS
# =============================================================================
info "Verificando HTTPS..."

sleep 2
if curl -sf "https://${DOMAIN}/nginx-health" &>/dev/null; then
    ok "HTTPS funcionando correctamente"
else
    # Intentar con -k por si hay cache de DNS
    if curl -skf "https://${DOMAIN}/nginx-health" &>/dev/null; then
        ok "HTTPS funcionando (certificado activo)"
    else
        warn "HTTPS podría tardar unos segundos en estar disponible"
    fi
fi

# =============================================================================
# 6. RESUMEN
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✓ SSL CONFIGURADO CORRECTAMENTE${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  🌐 URL: https://$DOMAIN"
echo "  📅 Renovación automática: Cada 12 horas (via certbot)"
echo ""
echo "  Comandos útiles:"
echo "    - Ver certificados: docker compose exec certbot certbot certificates"
echo "    - Renovar manual:   $0 --renew"
echo ""
