#!/bin/bash
# =============================================================================
# Joinly - Server Setup (Ubuntu/Debian)
# =============================================================================
# Uso: sudo ./scripts/setup-server.sh
#
# Este script configura un servidor nuevo con:
#   - Docker y Docker Compose
#   - Firewall (UFW)
#   - Fail2ban para protección SSH
#   - Optimizaciones del kernel
#   - Usuario joinly
# =============================================================================

set -e

# Verificar root
[ "$EUID" -ne 0 ] && { echo "[ERROR] Ejecutar como root: sudo $0"; exit 1; }

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 🖥️  JOINLY SERVER SETUP                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# =============================================================================
# 1. ACTUALIZAR SISTEMA
# =============================================================================
info "Actualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
ok "Sistema actualizado"

# =============================================================================
# 2. INSTALAR DEPENDENCIAS
# =============================================================================
info "Instalando dependencias..."
apt-get install -y -qq curl gnupg lsb-release ufw fail2ban git htop
ok "Dependencias instaladas"

# =============================================================================
# 3. INSTALAR DOCKER
# =============================================================================
if ! command -v docker &>/dev/null; then
    info "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    ok "Docker instalado"
else
    ok "Docker ya está instalado"
fi

# Verificar Docker Compose
if ! docker compose version &>/dev/null; then
    warn "Docker Compose no disponible, actualizando Docker..."
    apt-get install -y -qq docker-compose-plugin
fi

# =============================================================================
# 4. CREAR USUARIO
# =============================================================================
if ! id joinly &>/dev/null; then
    info "Creando usuario 'joinly'..."
    useradd -m -s /bin/bash joinly
    usermod -aG docker joinly
    ok "Usuario 'joinly' creado"
else
    usermod -aG docker joinly 2>/dev/null || true
    ok "Usuario 'joinly' ya existe"
fi

# =============================================================================
# 5. CONFIGURAR FIREWALL
# =============================================================================
info "Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
echo "y" | ufw enable
ok "Firewall configurado (SSH, HTTP, HTTPS)"

# =============================================================================
# 6. CONFIGURAR FAIL2BAN
# =============================================================================
info "Configurando Fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
maxretry = 3
EOF
systemctl restart fail2ban
systemctl enable fail2ban
ok "Fail2ban configurado"

# =============================================================================
# 7. OPTIMIZACIONES DEL KERNEL
# =============================================================================
info "Aplicando optimizaciones..."

# Solo agregar si no existen
grep -q "net.core.somaxconn" /etc/sysctl.conf || cat >> /etc/sysctl.conf << 'EOF'

# Joinly optimizations
net.core.somaxconn = 65535
vm.swappiness = 10
net.ipv4.tcp_tw_reuse = 1
fs.file-max = 65535
EOF

sysctl -p 2>/dev/null || true
ok "Optimizaciones aplicadas"

# =============================================================================
# 8. CREAR DIRECTORIO DEL PROYECTO
# =============================================================================
info "Creando directorio /opt/joinly..."
mkdir -p /opt/joinly
chown -R joinly:joinly /opt/joinly
ok "Directorio creado"

# =============================================================================
# RESUMEN
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✓ SERVIDOR CONFIGURADO CORRECTAMENTE${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Próximos pasos:"
echo ""
echo "  1. Clonar el repositorio:"
echo "     ${BLUE}git clone <repo-url> /opt/joinly${NC}"
echo ""
echo "  2. Configurar variables de entorno:"
echo "     ${BLUE}cd /opt/joinly${NC}"
echo "     ${BLUE}cp .env.prod.example .env.prod${NC}"
echo "     ${BLUE}nano .env.prod${NC}  # Editar con tus valores"
echo ""
echo "  3. Desplegar:"
echo "     ${BLUE}./scripts/deploy.sh --build${NC}"
echo ""
echo "  4. Configurar SSL (después de configurar DNS):"
echo "     ${BLUE}./scripts/init-ssl.sh${NC}"
echo ""
echo "  5. Verificar estado:"
echo "     ${BLUE}./scripts/health-check.sh${NC}"
echo ""
