#!/bin/bash
# =============================================================================
# Joinly - Script de Configuración Inicial del Servidor
# =============================================================================
# Prepara un servidor Ubuntu/Debian para desplegar Joinly.
# Ejecutar UNA VEZ en un servidor nuevo.
#
# Uso: curl -sSL <url>/setup-server.sh | sudo bash
#   o: sudo ./scripts/setup-server.sh
#
# Requisitos:
#   - Ubuntu 22.04+ o Debian 12+
#   - Acceso root/sudo
#   - Conexión a internet
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar root
if [ "$EUID" -ne 0 ]; then
    log_error "Este script debe ejecutarse como root (sudo)"
    exit 1
fi

echo ""
echo "=========================================="
echo "   JOINLY - CONFIGURACIÓN DEL SERVIDOR   "
echo "=========================================="
echo ""

# =============================================================================
# Actualizar sistema
# =============================================================================

log_info "Actualizando sistema..."
apt-get update
apt-get upgrade -y

# =============================================================================
# Instalar dependencias básicas
# =============================================================================

log_info "Instalando dependencias básicas..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    fail2ban \
    htop \
    vim \
    git \
    unzip

# =============================================================================
# Instalar Docker
# =============================================================================

log_info "Instalando Docker..."

# Eliminar versiones antiguas
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Añadir repositorio oficial de Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Iniciar y habilitar Docker
systemctl start docker
systemctl enable docker

log_success "Docker instalado: $(docker --version)"

# =============================================================================
# Crear usuario para la aplicación
# =============================================================================

APP_USER="joinly"

if ! id "$APP_USER" &>/dev/null; then
    log_info "Creando usuario $APP_USER..."
    useradd -m -s /bin/bash "$APP_USER"
    usermod -aG docker "$APP_USER"
    log_success "Usuario $APP_USER creado"
else
    log_info "Usuario $APP_USER ya existe"
    usermod -aG docker "$APP_USER"
fi

# =============================================================================
# Configurar Firewall (UFW)
# =============================================================================

log_info "Configurando firewall..."

ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https

# Habilitar sin confirmación
echo "y" | ufw enable

log_success "Firewall configurado"
ufw status

# =============================================================================
# Configurar Fail2ban
# =============================================================================

log_info "Configurando Fail2ban..."

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban
systemctl enable fail2ban

log_success "Fail2ban configurado"

# =============================================================================
# Configurar límites del sistema
# =============================================================================

log_info "Configurando límites del sistema..."

cat >> /etc/sysctl.conf << 'EOF'

# Joinly - Optimizaciones de red
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.core.netdev_max_backlog = 65535

# Optimizaciones de memoria
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2
EOF

sysctl -p

log_success "Límites del sistema configurados"

# =============================================================================
# Crear directorio de la aplicación
# =============================================================================

APP_DIR="/opt/joinly"

log_info "Creando directorio de la aplicación..."
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

log_success "Directorio creado: $APP_DIR"

# =============================================================================
# Configurar logrotate para Docker
# =============================================================================

log_info "Configurando logrotate para Docker..."

cat > /etc/logrotate.d/docker-containers << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF

log_success "Logrotate configurado"

# =============================================================================
# Resumen
# =============================================================================

echo ""
echo "=========================================="
echo "      CONFIGURACIÓN COMPLETADA           "
echo "=========================================="
echo ""
echo -e "${GREEN}El servidor está listo para desplegar Joinly${NC}"
echo ""
echo "Próximos pasos:"
echo "  1. Clonar el repositorio en $APP_DIR:"
echo "     su - $APP_USER"
echo "     cd $APP_DIR"
echo "     git clone <repo_url> ."
echo ""
echo "  2. Configurar variables de entorno:"
echo "     cp .env.prod.example .env.prod"
echo "     nano .env.prod"
echo ""
echo "  3. Iniciar la aplicación:"
echo "     ./scripts/deploy.sh --build"
echo ""
echo "  4. Configurar SSL:"
echo "     ./scripts/init-ssl.sh"
echo ""
echo "Información del sistema:"
echo "  - Usuario: $APP_USER"
echo "  - Directorio: $APP_DIR"
echo "  - Docker: $(docker --version)"
echo "  - Firewall: $(ufw status | head -1)"
echo ""
log_success "¡Configuración del servidor completada!"
