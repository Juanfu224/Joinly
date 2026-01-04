#!/usr/bin/env bash
# =============================================================================
# Joinly - Script de Inicialización de SSL con Let's Encrypt
# =============================================================================
# Este script configura los certificados SSL iniciales.
# Ejecutar UNA VEZ después de configurar el dominio y DNS.
#
# Requisitos:
#   - Dominio apuntando al servidor (DNS A record)
#   - Puertos 80 y 443 abiertos
#   - Docker y Docker Compose instalados
#
# Uso: ./scripts/init-ssl.sh [--auto]
#   --auto: Ejecutar sin confirmación interactiva
# =============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Variables
ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
AUTO_MODE=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto|-y)
            AUTO_MODE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Verificaciones
# =============================================================================

if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo $ENV_FILE no encontrado"
    log_info "Copia .env.prod.example a .env.prod y configura las variables"
    exit 1
fi

# Cargar variables de entorno
set -a
source "$ENV_FILE"
set +a

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "joinly.example.com" ]; then
    log_error "DOMAIN no está configurado en $ENV_FILE"
    exit 1
fi

if [ -z "$LETSENCRYPT_EMAIL" ] || [ "$LETSENCRYPT_EMAIL" = "admin@example.com" ]; then
    log_error "LETSENCRYPT_EMAIL no está configurado en $ENV_FILE"
    exit 1
fi

# =============================================================================
# Inicio
# =============================================================================

echo ""
echo "=========================================="
echo "   JOINLY - INICIALIZACIÓN SSL           "
echo "=========================================="
echo ""
echo "Dominio: $DOMAIN"
echo "Email:   $LETSENCRYPT_EMAIL"
echo ""

if [ "$AUTO_MODE" = false ]; then
    read -p "¿Continuar con la configuración SSL? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# =============================================================================
# Paso 1: Verificar que los servicios están corriendo
# =============================================================================

log_info "Verificando servicios..."

# Verificar que mysql y backend están corriendo
if ! docker compose -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "joinly-mysql-prod"; then
    log_info "Levantando servicios base..."
    docker compose -f "$COMPOSE_FILE" up -d mysql backend
    log_info "Esperando a que los servicios estén listos..."
    sleep 30
fi

# Verificar que nginx está corriendo (necesario para el challenge de certbot)
if ! docker compose -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "joinly-nginx-prod"; then
    log_info "Levantando nginx..."
    docker compose -f "$COMPOSE_FILE" up -d nginx
    log_info "Esperando a que Nginx esté listo..."
    sleep 10
fi

# Mostrar estado actual
log_info "Estado de los servicios:"
docker compose -f "$COMPOSE_FILE" ps

# =============================================================================
# Paso 2: Crear configuración inicial para ACME challenge
# =============================================================================

log_info "Preparando para el challenge de Let's Encrypt..."

# Crear directorio para el challenge si no existe
mkdir -p certbot/www certbot/conf

# =============================================================================
# Paso 3: Obtener certificado SSL
# =============================================================================

log_info "Obteniendo certificado SSL de Let's Encrypt..."
log_info "Esto puede tardar unos minutos..."

# Ejecutar certbot con el método webroot
# El challenge se servirá a través de nginx en /.well-known/acme-challenge/
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

CERTBOT_EXIT_CODE=$?

if [ $CERTBOT_EXIT_CODE -eq 0 ]; then
    log_success "Certificado SSL obtenido correctamente"
else
    log_error "Error al obtener certificado SSL (código: $CERTBOT_EXIT_CODE)"
    echo ""
    log_info "Posibles causas:"
    log_info "  1. El dominio $DOMAIN no apunta a este servidor (IP: $(curl -s ifconfig.me))"
    log_info "  2. Los puertos 80/443 no están abiertos en el firewall"
    log_info "  3. Nginx no está sirviendo el challenge correctamente"
    log_info "  4. Has excedido el límite de solicitudes de Let's Encrypt"
    echo ""
    log_info "Para depurar, revisa los logs:"
    log_info "  docker compose -f $COMPOSE_FILE logs nginx"
    log_info "  docker compose -f $COMPOSE_FILE logs certbot"
    exit 1
fi

# =============================================================================
# Paso 4: Configurar nginx para usar certificados de Let's Encrypt
# =============================================================================

log_info "Configurando nginx para usar los nuevos certificados..."

# Verificar que los certificados existen
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
if docker compose -f "$COMPOSE_FILE" exec -T nginx test -f "$CERT_PATH/fullchain.pem" 2>/dev/null; then
    log_success "Certificados encontrados en $CERT_PATH"
else
    log_warning "Los certificados pueden estar en una ubicación diferente"
fi

# =============================================================================
# Paso 5: Reiniciar nginx con los nuevos certificados
# =============================================================================

log_info "Reiniciando nginx con SSL habilitado..."
docker compose -f "$COMPOSE_FILE" restart nginx

# Esperar a que nginx esté listo
sleep 5

# =============================================================================
# Verificación final
# =============================================================================

log_info "Verificando configuración SSL..."

# Test HTTP -> HTTPS redirect
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "http://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTP_REDIRECT" = "301" ] || [ "$HTTP_REDIRECT" = "302" ]; then
    log_success "Redirección HTTP → HTTPS funcionando (código: $HTTP_REDIRECT)"
else
    log_warning "Redirección HTTP → HTTPS puede no estar funcionando (código: $HTTP_REDIRECT)"
fi

# Test HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    log_success "HTTPS funcionando correctamente"
else
    log_warning "HTTPS puede no estar funcionando (código: $HTTPS_STATUS)"
fi

# Verificar validez del certificado
log_info "Verificando certificado SSL..."
CERT_INFO=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
if [ -n "$CERT_INFO" ]; then
    echo "$CERT_INFO"
    log_success "Certificado SSL válido"
else
    log_warning "No se pudo verificar el certificado"
fi

# =============================================================================
# Resumen
# =============================================================================

echo ""
echo "=========================================="
echo "         CONFIGURACIÓN COMPLETADA        "
echo "=========================================="
echo ""
echo -e "${GREEN}Tu aplicación está disponible en:${NC}"
echo ""
echo "  🌐 https://$DOMAIN"
echo "  🔒 Certificado SSL de Let's Encrypt activo"
echo ""
echo -e "${YELLOW}Notas importantes:${NC}"
echo "  - Los certificados se renuevan automáticamente cada 12 horas"
echo "  - El servicio certbot verifica la renovación periódicamente"
echo "  - Los certificados expiran en 90 días (se renuevan antes)"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo "  - Ver logs: docker compose -f $COMPOSE_FILE logs -f"
echo "  - Ver estado: docker compose -f $COMPOSE_FILE ps"
echo "  - Renovar manualmente: docker compose -f $COMPOSE_FILE run --rm certbot renew"
echo ""
log_success "¡Configuración SSL completada exitosamente!"
