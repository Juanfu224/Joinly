#!/bin/bash
# =============================================================================
# Joinly - Script de Verificación Pre-Deploy
# =============================================================================
# Verifica que todo está correctamente configurado antes del despliegue
# Uso: ./scripts/pre-deploy-check.sh
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

ENV_FILE=".env.prod"
ERRORS=0
WARNINGS=0

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; ((WARNINGS++)); }
log_error() { echo -e "${RED}[✗]${NC} $1"; ((ERRORS++)); }

echo ""
echo "=========================================="
echo "   JOINLY - VERIFICACIÓN PRE-DEPLOY      "
echo "=========================================="
echo ""

# =============================================================================
# Verificar Archivos Necesarios
# =============================================================================
log_info "Verificando archivos necesarios..."

check_file() {
    if [ -f "$1" ]; then
        log_success "Archivo encontrado: $1"
    else
        log_error "Archivo no encontrado: $1"
    fi
}

check_file "docker-compose.prod.yml"
check_file ".env.prod.example"
check_file "backend/Dockerfile"
check_file "frontend/Dockerfile"
check_file "nginx/nginx.conf"
check_file "scripts/deploy.sh"
check_file "scripts/init-ssl.sh"

echo ""

# =============================================================================
# Verificar Variables de Entorno
# =============================================================================
log_info "Verificando variables de entorno..."

if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo $ENV_FILE no encontrado"
    log_info "Ejecuta: cp .env.prod.example .env.prod"
    ERRORS=$((ERRORS + 1))
else
    source "$ENV_FILE"
    
    # Verificar DOMAIN
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "joinly.example.com" ]; then
        log_error "DOMAIN no está configurado correctamente"
    else
        log_success "DOMAIN configurado: $DOMAIN"
    fi
    
    # Verificar EMAIL
    if [ -z "$LETSENCRYPT_EMAIL" ] || [ "$LETSENCRYPT_EMAIL" = "admin@example.com" ]; then
        log_error "LETSENCRYPT_EMAIL no está configurado"
    else
        log_success "LETSENCRYPT_EMAIL configurado"
    fi
    
    # Verificar JWT_SECRET_KEY
    if [ -z "$JWT_SECRET_KEY" ]; then
        log_error "JWT_SECRET_KEY no está configurado"
    elif [[ "$JWT_SECRET_KEY" == *"GENERAR"* ]]; then
        log_error "JWT_SECRET_KEY no ha sido generado"
        log_info "Ejecuta: openssl rand -base64 64"
    else
        log_success "JWT_SECRET_KEY configurado"
    fi
    
    # Verificar ENCRYPTION_KEY
    if [ -z "$ENCRYPTION_KEY" ]; then
        log_error "ENCRYPTION_KEY no está configurado"
    elif [[ "$ENCRYPTION_KEY" == *"GENERAR"* ]]; then
        log_error "ENCRYPTION_KEY no ha sido generado"
        log_info "Ejecuta: openssl rand -base64 32"
    else
        log_success "ENCRYPTION_KEY configurado"
    fi
    
    # Verificar MySQL passwords
    if [ -z "$MYSQL_ROOT_PASSWORD" ] || [[ "$MYSQL_ROOT_PASSWORD" == *"GENERAR"* ]]; then
        log_error "MYSQL_ROOT_PASSWORD no está configurado"
    else
        log_success "MYSQL_ROOT_PASSWORD configurado"
    fi
    
    if [ -z "$MYSQL_PASSWORD" ] || [[ "$MYSQL_PASSWORD" == *"GENERAR"* ]]; then
        log_error "MYSQL_PASSWORD no está configurado"
    else
        log_success "MYSQL_PASSWORD configurado"
    fi
fi

echo ""

# =============================================================================
# Verificar Docker
# =============================================================================
log_info "Verificando Docker..."

if command -v docker &> /dev/null; then
    log_success "Docker instalado: $(docker --version)"
    
    if docker compose version &> /dev/null; then
        log_success "Docker Compose instalado"
    else
        log_error "Docker Compose no está instalado"
    fi
else
    log_error "Docker no está instalado"
fi

echo ""

# =============================================================================
# Verificar Permisos de Scripts
# =============================================================================
log_info "Verificando permisos de scripts..."

check_executable() {
    if [ -x "$1" ]; then
        log_success "Script ejecutable: $1"
    else
        log_warning "Script no ejecutable: $1"
        log_info "Ejecuta: chmod +x $1"
    fi
}

check_executable "scripts/deploy.sh"
check_executable "scripts/init-ssl.sh"
check_executable "scripts/backup.sh"
check_executable "scripts/restore.sh"

echo ""

# =============================================================================
# Verificar Puertos
# =============================================================================
log_info "Verificando puertos disponibles..."

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Puerto $1 está en uso"
    else
        log_success "Puerto $1 disponible"
    fi
}

check_port 80
check_port 443

echo ""

# =============================================================================
# Verificar DNS (si DOMAIN está configurado)
# =============================================================================
if [ ! -z "$DOMAIN" ] && [ "$DOMAIN" != "joinly.example.com" ]; then
    log_info "Verificando configuración DNS..."
    
    if command -v dig &> /dev/null; then
        DNS_IP=$(dig +short "$DOMAIN" | tail -1)
        if [ ! -z "$DNS_IP" ]; then
            log_success "DNS resuelve a: $DNS_IP"
            
            # Intentar obtener IP pública del servidor
            if command -v curl &> /dev/null; then
                SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "")
                if [ ! -z "$SERVER_IP" ]; then
                    if [ "$DNS_IP" = "$SERVER_IP" ]; then
                        log_success "DNS apunta a este servidor correctamente"
                    else
                        log_warning "DNS ($DNS_IP) no apunta a este servidor ($SERVER_IP)"
                    fi
                fi
            fi
        else
            log_warning "No se pudo resolver DNS para $DOMAIN"
            log_info "Verifica que el dominio apunta a la IP del servidor"
        fi
    else
        log_warning "dig no está instalado, saltando verificación DNS"
    fi
fi

echo ""

# =============================================================================
# Verificar Espacio en Disco
# =============================================================================
log_info "Verificando espacio en disco..."

DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log_warning "Uso de disco alto: ${DISK_USAGE}%"
else
    log_success "Espacio en disco suficiente: ${DISK_USAGE}% usado"
fi

echo ""

# =============================================================================
# Verificar Memoria
# =============================================================================
log_info "Verificando memoria disponible..."

TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
if [ "$TOTAL_MEM" -lt 2000 ]; then
    log_warning "Memoria total: ${TOTAL_MEM}MB (recomendado: 4GB)"
else
    log_success "Memoria total: ${TOTAL_MEM}MB"
fi

echo ""

# =============================================================================
# Verificar Archivos Sensibles
# =============================================================================
log_info "Verificando que archivos sensibles no están en Git..."

if git rev-parse --git-dir > /dev/null 2>&1; then
    # Verificar que .env.prod no está trackeado
    if git ls-files --error-unmatch .env.prod >/dev/null 2>&1; then
        log_error ".env.prod está en Git (PELIGRO DE SEGURIDAD)"
        log_info "Ejecuta: git rm --cached .env.prod"
    else
        log_success ".env.prod no está en Git"
    fi
    
    # Verificar .gitignore
    if [ -f ".gitignore" ]; then
        if grep -q ".env.prod" .gitignore; then
            log_success ".env.prod está en .gitignore"
        else
            log_warning ".env.prod debería estar en .gitignore"
        fi
    fi
fi

echo ""

# =============================================================================
# Resumen
# =============================================================================
echo "=========================================="
echo "           RESUMEN DE VERIFICACIÓN       "
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ PERFECTO${NC} - Todo está listo para el despliegue"
    echo ""
    echo "Próximos pasos:"
    echo "  1. ./scripts/deploy.sh --build"
    echo "  2. ./scripts/init-ssl.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ADVERTENCIAS${NC} - Hay $WARNINGS advertencias"
    echo ""
    echo "Revisa las advertencias antes de continuar"
    echo "Puedes continuar con precaución ejecutando:"
    echo "  ./scripts/deploy.sh --build"
    exit 0
else
    echo -e "${RED}✗ ERRORES${NC} - Hay $ERRORS errores que deben corregirse"
    echo ""
    echo "Corrige los errores antes de desplegar"
    exit 1
fi
