#!/usr/bin/env bash
# =============================================================================
# Joinly - Quick Deploy Script (Remote Server Deployment)
# =============================================================================
# Uso: ./scripts/quick-deploy.sh [user@]hostname [directory]
#
# Este script automatiza todo el proceso de despliegue en un servidor remoto:
#   1. Copia el código al servidor remoto (rsync con ssh)
#   2. Ejecuta setup-server.sh si es necesario
#   3. Copia .env.prod al servidor
#   4. Ejecuta deploy.sh --build en el servidor
#   5. Ejecuta init-ssl.sh --auto para configurar Let's Encrypt
#   6. Verifica el despliegue con health-check.sh
#
# Requisitos:
#   - SSH configurado con claves para acceso sin contraseña
#   - rsync instalado localmente
#   - Servidor con Ubuntu 22.04+
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="$(pwd)"

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

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                🚀 JOINLY QUICK DEPLOY                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar argumentos
if [ $# -lt 1 ]; then
    echo "Uso: $0 [user@]hostname [directory]"
    echo ""
    echo "Ejemplos:"
    echo "  $0 root@joinly.studio /opt/joinly"
    echo "  $0 joinly@192.168.1.100"
    echo ""
    echo "Si no se especifica directory, se usará /opt/joinly"
    exit 1
fi

REMOTE_HOST="$1"
REMOTE_DIR="${2:-/opt/joinly}"

info "Servidor: $REMOTE_HOST"
info "Directorio: $REMOTE_DIR"
echo ""

# =============================================================================
# 1. VERIFICAR DEPENDENCIAS LOCALES
# =============================================================================
info "Verificando dependencias locales..."

command -v ssh &>/dev/null || err "SSH no instalado"
command -v rsync &>/dev/null || err "rsync no instalado"

# Verificar acceso SSH
if ! ssh -o ConnectTimeout=10 "$REMOTE_HOST" echo "Conexión SSH exitosa" &>/dev/null; then
    err "No se puede conectar a $REMOTE_HOST"
fi

ok "Dependencias locales verificadas"

# =============================================================================
# 2. VERIFICAR ARCHIVO .ENV.PROD
# =============================================================================
info "Verificando configuración de producción..."

if [ ! -f ".env.prod" ]; then
    if [ -f ".env.prod.example" ]; then
        warn ".env.prod no encontrado, creando desde .env.prod.example..."
        cp .env.prod.example .env.prod
        warn "⚠️  EDITAR .env.prod ANTES de continuar"
        warn "⚠️  Generar claves con: openssl rand -base64 32/64"
        read -p "¿Continuar con el despliegue? (y/n) " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    else
        err "Archivo .env.prod o .env.prod.example no encontrado"
    fi
fi

ok "Configuración de producción verificada"

# =============================================================================
# 3. COPIAR CÓDIGO AL SERVIDOR
# =============================================================================
info "Copiando código al servidor..."

# Excluir archivos innecesarios
RSYNC_EXCLUDE="--exclude=node_modules \
                --exclude=dist \
                --exclude=target \
                --exclude=.git \
                --exclude=.venv \
                --exclude=venv \
                --exclude=__pycache__ \
                --exclude=*.pyc \
                --exclude=.idea \
                --exclude=.vscode \
                --exclude=.env \
                --exclude=.env.local \
                --exclude=backups \
                --exclude=ssl \
                --exclude=*.log \
                --exclude=.env.prod"

if rsync -avz --delete --progress \
    $RSYNC_EXCLUDE \
    "$PROJECT_ROOT/" \
    "$REMOTE_HOST:$REMOTE_DIR/"; then
    ok "Código copiado exitosamente"
else
    err "Error copiando código al servidor"
fi

# =============================================================================
# 4. CONFIGURAR VARIABLES DE ENTORNO EN EL SERVIDOR
# =============================================================================
info "Configurando variables de entorno en el servidor..."

# Copiar .env.prod al servidor
scp "$PROJECT_ROOT/.env.prod" "$REMOTE_HOST:$REMOTE_DIR/.env.prod" || err "Error copiando .env.prod"

# Asegurar que .env exista (symlink a .env.prod)
ssh "$REMOTE_HOST" "cd $REMOTE_DIR && [ ! -f .env ] && ln -sf .env.prod .env || true"

ok "Variables de entorno configuradas"

# =============================================================================
# 5. EJECUTAR SETUP-SERVER.SH (SI ES NECESARIO)
# =============================================================================
if [ "${SKIP_SETUP:-false}" != "true" ]; then
    info "Verificando si el servidor necesita configuración inicial..."
    
    # Verificar si Docker está instalado en el servidor
    if ! ssh "$REMOTE_HOST" "command -v docker" &>/dev/null; then
        warn "Docker no instalado en el servidor, ejecutando setup-server.sh..."
        ssh "$REMOTE_HOST" "cd $REMOTE_DIR && sudo ./scripts/setup-server.sh" || warn "Error en setup-server.sh, continuando..."
    else
        ok "Servidor ya configurado"
    fi
fi

# =============================================================================
# 6. EJECUTAR DEPLOY.SH EN EL SERVIDOR
# =============================================================================
info "Iniciando despliegue en el servidor..."

ssh "$REMOTE_HOST" "cd $REMOTE_DIR && ./scripts/deploy.sh --build" || err "Error durante el despliegue"

ok "Despliegue completado"

# =============================================================================
# 7. CONFIGURAR SSL CON LET'S ENCRYPT
# =============================================================================
info "Configurando SSL con Let's Encrypt..."

# Verificar si el dominio está configurado
DOMAIN=$(grep "^DOMAIN=" .env.prod | cut -d= -f2)

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = *"example"* ]; then
    warn "DOMAIN no configurado correctamente en .env.prod"
    warn "Omitiendo configuración SSL automática"
    warn "Ejecutar manualmente: ssh $REMOTE_HOST 'cd $REMOTE_DIR && ./scripts/init-ssl.sh'"
else
    info "Dominio: $DOMAIN"
    
    # Verificar si el dominio resuelve
    SERVER_IP=$(ssh "$REMOTE_HOST" "curl -sf https://api.ipify.org 2>/dev/null || curl -sf https://ifconfig.me 2>/dev/null || echo ''")
    DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | head -1 || echo '')
    
    if [ -n "$SERVER_IP" ] && [ -n "$DOMAIN_IP" ] && [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        ok "DNS configurado correctamente ($DOMAIN -> $SERVER_IP)"
        
        # Intentar configurar SSL
        if ssh "$REMOTE_HOST" "cd $REMOTE_DIR && ./scripts/init-ssl.sh --auto"; then
            ok "SSL configurado exitosamente"
        else
            warn "Error configurando SSL (puede que ya esté configurado)"
        fi
    else
        warn "El dominio $DOMAIN no apunta a este servidor ($SERVER_IP)"
        warn "Omitiendo configuración SSL automática"
        warn "Ejecutar manualmente: ssh $REMOTE_HOST 'cd $REMOTE_DIR && ./scripts/init-ssl.sh'"
    fi
fi

# =============================================================================
# 8. VERIFICAR DESPLIEGUE
# =============================================================================
info "Verificando despliegue..."

sleep 5

HEALTH_OUTPUT=$(ssh "$REMOTE_HOST" "cd $REMOTE_DIR && ./scripts/health-check.sh --quiet 2>&1" || echo "ERROR")

if [ "$HEALTH_OUTPUT" = "0" ] || [ $? -eq 0 ]; then
    ok "Health check: Todos los servicios funcionando"
else
    warn "Health check detectó problemas:"
    ssh "$REMOTE_HOST" "cd $REMOTE_DIR && ./scripts/health-check.sh"
fi

# =============================================================================
# 9. MOSTRAR LOGS
# =============================================================================
echo ""
echo -e "${BLUE}¿Desea ver los logs de los servicios? (y/n)${NC}"
read -p " " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Mostrando logs (Ctrl+C para salir)..."
    ssh "$REMOTE_HOST" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs -f"
fi

# =============================================================================
# 10. RESUMEN FINAL
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✓ DESPLIEGUE COMPLETADO${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ -n "$DOMAIN" ] && [ "$DOMAIN" != *"example"* ]; then
    echo -e "  🌐 URL:       ${GREEN}https://$DOMAIN${NC}"
fi
echo -e "  🖥️  Servidor:   $REMOTE_HOST"
echo -e "  📂 Directorio: $REMOTE_DIR"
echo ""

echo -e "Comandos útiles:"
echo -e "  - Ver logs:           ${YELLOW}ssh $REMOTE_HOST 'cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs -f'${NC}"
echo -e "  - Health check:      ${YELLOW}ssh $REMOTE_HOST 'cd $REMOTE_DIR && ./scripts/health-check.sh'${NC}"
echo -e "  - Reiniciar servicios: ${YELLOW}ssh $REMOTE_HOST 'cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml restart'${NC}"
echo -e "  - Backup:             ${YELLOW}ssh $REMOTE_HOST 'cd $REMOTE_DIR && ./scripts/backup.sh'${NC}"
echo ""

exit 0
