#!/bin/bash
# =============================================================================
# Joinly - Script de Despliegue Rápido (Quick Deploy)
# =============================================================================
# Despliega automáticamente Joinly en un VPS nuevo.
# Este script combina setup-server.sh y deploy.sh en uno solo.
#
# REQUISITOS:
#   - Servidor Ubuntu 22.04+ o 24.04 LTS
#   - Acceso root via SSH
#   - Dominio configurado (opcional para primera fase)
#
# USO DESDE TU MÁQUINA LOCAL:
#   ./scripts/quick-deploy.sh root@159.89.1.100
#
# O DIRECTAMENTE EN EL SERVIDOR:
#   curl -sSL https://raw.githubusercontent.com/Juanfu224/Joinly/main/scripts/quick-deploy.sh | bash
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_step() { echo -e "${CYAN}[PASO]${NC} $1"; }

# =============================================================================
# Configuración
# =============================================================================

REPO_URL="https://github.com/Juanfu224/Joinly.git"
APP_DIR="/opt/joinly"
APP_USER="joinly"
SERVER_IP="${1:-}"

# =============================================================================
# Banner
# =============================================================================

show_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║         🚀  JOINLY - DESPLIEGUE RÁPIDO A PRODUCCIÓN          ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# =============================================================================
# Función principal de despliegue
# =============================================================================

deploy_on_server() {
    log_step "1/8 - Verificando sistema..."
    
    # Verificar si es root
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script debe ejecutarse como root"
        exit 1
    fi
    
    # Detectar sistema operativo
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
        log_info "Sistema detectado: $PRETTY_NAME"
    else
        log_error "No se pudo detectar el sistema operativo"
        exit 1
    fi
    
    # Verificar que es Ubuntu/Debian
    if [[ "$OS" != "ubuntu" && "$OS" != "debian" ]]; then
        log_error "Este script solo funciona en Ubuntu o Debian"
        exit 1
    fi
    
    log_step "2/8 - Actualizando sistema..."
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
    apt-get install -y -qq curl git ca-certificates gnupg lsb-release ufw fail2ban htop
    log_success "Sistema actualizado"
    
    log_step "3/8 - Instalando Docker..."
    if ! command -v docker &> /dev/null; then
        # Instalar Docker
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes 2>/dev/null
        chmod a+r /etc/apt/keyrings/docker.gpg
        
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
          tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        apt-get update -qq
        apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        systemctl start docker
        systemctl enable docker
        log_success "Docker instalado: $(docker --version)"
    else
        log_success "Docker ya está instalado"
    fi
    
    log_step "4/8 - Configurando firewall..."
    ufw --force reset > /dev/null 2>&1
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    echo "y" | ufw enable > /dev/null 2>&1
    log_success "Firewall configurado"
    
    log_step "5/8 - Creando usuario de aplicación..."
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$APP_USER"
        usermod -aG docker "$APP_USER"
        log_success "Usuario $APP_USER creado"
    else
        log_info "Usuario $APP_USER ya existe"
    fi
    
    log_step "6/8 - Clonando repositorio..."
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
        git clone "$REPO_URL" "$APP_DIR"
        chown -R "$APP_USER:$APP_USER" "$APP_DIR"
        log_success "Repositorio clonado en $APP_DIR"
    else
        log_info "Directorio ya existe, actualizando..."
        cd "$APP_DIR"
        git pull origin main
        chown -R "$APP_USER:$APP_USER" "$APP_DIR"
        log_success "Repositorio actualizado"
    fi
    
    log_step "7/8 - Configurando variables de entorno..."
    cd "$APP_DIR"
    
    if [ ! -f ".env.prod" ]; then
        log_info "Generando archivo .env.prod con valores seguros..."
        
        # Generar contraseñas aleatorias seguras
        MYSQL_ROOT_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        MYSQL_USER_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        
        # Obtener IP del servidor
        SERVER_IP_DETECTED=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
        
        cat > .env.prod << EOF
# =============================================================================
# JOINLY - Configuración de Producción
# Generado automáticamente el $(date)
# =============================================================================

# Configuración General
DOMAIN=${DOMAIN:-$SERVER_IP_DETECTED}
LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL:-admin@example.com}
APP_VERSION=1.0.0

# Base de Datos MySQL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASS
MYSQL_DATABASE=bbdd_joinly
MYSQL_USER=joinly_user
MYSQL_PASSWORD=$MYSQL_USER_PASS

# Backend Spring Boot
DB_USERNAME=joinly_user
DB_PASSWORD=$MYSQL_USER_PASS

# JWT Tokens
JWT_SECRET_KEY=$JWT_SECRET
JWT_ACCESS_TOKEN_EXPIRATION=3600000
JWT_REFRESH_TOKEN_EXPIRATION=2592000000

# Encriptación
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF
        
        chmod 600 .env.prod
        log_success "Archivo .env.prod creado con credenciales seguras"
        log_warning "IMPORTANTE: Guarda estas credenciales en un lugar seguro"
        echo ""
        echo -e "${YELLOW}=== CREDENCIALES GENERADAS ===${NC}"
        echo -e "MySQL Root:     $MYSQL_ROOT_PASS"
        echo -e "MySQL User:     $MYSQL_USER_PASS"
        echo -e "JWT Secret:     $JWT_SECRET"
        echo -e "Encryption Key: $ENCRYPTION_KEY"
        echo ""
        
        # Guardar también en un archivo de backup
        cat > .env.prod.backup << EOF
# Backup de credenciales generadas el $(date)
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASS
MYSQL_USER_PASSWORD=$MYSQL_USER_PASS
JWT_SECRET_KEY=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF
        chmod 600 .env.prod.backup
        
        log_info "Presiona ENTER para continuar con el despliegue..."
        read -r
    else
        log_success "Archivo .env.prod ya existe"
    fi
    
    log_step "8/8 - Desplegando aplicación..."
    
    # Hacer ejecutables los scripts
    chmod +x scripts/*.sh
    
    # Desplegar con Docker Compose
    log_info "Construyendo y levantando servicios..."
    docker compose -f docker-compose.prod.yml build --no-cache
    docker compose -f docker-compose.prod.yml up -d
    
    log_success "¡Aplicación desplegada!"
    
    # Esperar a que los servicios estén listos
    log_info "Esperando a que los servicios inicien..."
    sleep 20
    
    # Mostrar estado
    echo ""
    echo -e "${CYAN}=== ESTADO DE LOS SERVICIOS ===${NC}"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    
    # Obtener IP
    PUBLIC_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║   ✅  DESPLIEGUE COMPLETADO EXITOSAMENTE                     ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🌐 Tu aplicación está disponible en:${NC}"
    echo -e "   http://$PUBLIC_IP"
    echo ""
    echo -e "${CYAN}📊 Comandos útiles:${NC}"
    echo -e "   Ver logs:      ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "   Ver estado:    ${YELLOW}docker compose -f docker-compose.prod.yml ps${NC}"
    echo -e "   Reiniciar:     ${YELLOW}docker compose -f docker-compose.prod.yml restart${NC}"
    echo -e "   Detener:       ${YELLOW}docker compose -f docker-compose.prod.yml down${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  PRÓXIMOS PASOS:${NC}"
    echo -e "   1. Configura tu dominio para apuntar a $PUBLIC_IP"
    echo -e "   2. Actualiza DOMAIN en .env.prod con tu dominio"
    echo -e "   3. Ejecuta: ./scripts/init-ssl.sh para configurar HTTPS"
    echo ""
    
    # Mostrar logs iniciales
    log_info "Mostrando logs iniciales (Ctrl+C para salir)..."
    sleep 3
    docker compose -f docker-compose.prod.yml logs --tail=50
}

# =============================================================================
# Main
# =============================================================================

show_banner

if [ -z "$SERVER_IP" ]; then
    # Ejecución local en el servidor
    log_info "Ejecutando despliegue local en el servidor..."
    deploy_on_server
else
    # Ejecución remota desde máquina local
    log_info "Conectando a servidor remoto: $SERVER_IP"
    log_warning "Este modo ejecutará el script en el servidor remoto"
    
    # Copiar script al servidor y ejecutar
    scp "$0" "$SERVER_IP:/tmp/quick-deploy.sh"
    ssh "$SERVER_IP" "chmod +x /tmp/quick-deploy.sh && /tmp/quick-deploy.sh"
fi
