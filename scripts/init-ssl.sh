#!/bin/bash
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
# Uso: ./scripts/init-ssl.sh
# =============================================================================

set -e

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

source "$ENV_FILE"

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

read -p "¿Continuar con la configuración SSL? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# =============================================================================
# Paso 1: Levantar servicios sin SSL
# =============================================================================

log_info "Levantando servicios en modo inicial (sin SSL)..."

# Asegurarse de que nginx usa la configuración inicial
docker compose -f "$COMPOSE_FILE" up -d mysql backend frontend

log_info "Esperando a que los servicios estén listos..."
sleep 30

# Levantar nginx con config inicial
docker compose -f "$COMPOSE_FILE" up -d nginx

log_info "Esperando a que Nginx esté listo..."
sleep 10

# =============================================================================
# Paso 2: Obtener certificado SSL
# =============================================================================

log_info "Obteniendo certificado SSL de Let's Encrypt..."

# Crear directorios para certbot
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

if [ $? -eq 0 ]; then
    log_success "Certificado SSL obtenido correctamente"
else
    log_error "Error al obtener certificado SSL"
    log_info "Verifica que:"
    log_info "  - El dominio $DOMAIN apunta a este servidor"
    log_info "  - Los puertos 80 y 443 están abiertos"
    log_info "  - No hay otro servicio usando el puerto 80"
    exit 1
fi

# =============================================================================
# Paso 3: Activar configuración SSL
# =============================================================================

log_info "Activando configuración SSL completa..."

# Actualizar nginx para usar la configuración con SSL
# El comando en docker-compose.prod.yml usa envsubst para reemplazar variables
docker compose -f "$COMPOSE_FILE" exec nginx sh -c "
    envsubst '\$DOMAIN' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf &&
    nginx -s reload
"

log_success "Configuración SSL activada"

# =============================================================================
# Paso 4: Reiniciar servicios
# =============================================================================

log_info "Reiniciando servicios con SSL habilitado..."

docker compose -f "$COMPOSE_FILE" restart nginx

# =============================================================================
# Verificación final
# =============================================================================

log_info "Verificando configuración..."
sleep 5

# Test HTTP -> HTTPS redirect
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || echo "000")
if [ "$HTTP_REDIRECT" = "301" ]; then
    log_success "Redirección HTTP → HTTPS funcionando"
else
    log_warning "Redirección HTTP → HTTPS puede no estar funcionando (código: $HTTP_REDIRECT)"
fi

# Test HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    log_success "HTTPS funcionando correctamente"
else
    log_warning "HTTPS puede no estar funcionando (código: $HTTPS_STATUS)"
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
echo "  📚 https://$DOMAIN/swagger-ui/"
echo ""
echo -e "${YELLOW}Notas importantes:${NC}"
echo "  - Los certificados se renuevan automáticamente"
echo "  - El servicio certbot verifica cada 12 horas"
echo "  - Los logs están en: docker compose -f $COMPOSE_FILE logs"
echo ""
log_success "¡Configuración SSL completada!"
