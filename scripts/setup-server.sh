#!/bin/bash
# =============================================================================
# Joinly - Server Setup (Ubuntu/Debian)
# =============================================================================
# Uso: sudo ./scripts/setup-server.sh
# =============================================================================

set -e

[ "$EUID" -ne 0 ] && { echo "[ERROR] Ejecutar como root (sudo)"; exit 1; }

echo "=== Joinly Server Setup ==="

# Actualizar
apt-get update && apt-get upgrade -y

# Dependencias
apt-get install -y curl gnupg lsb-release ufw fail2ban

# Docker
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

# Usuario
if ! id joinly &>/dev/null; then
    useradd -m -s /bin/bash joinly
    usermod -aG docker joinly
fi

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh http https
echo "y" | ufw enable

# Fail2ban
cat > /etc/fail2ban/jail.local << 'F2B'
[sshd]
enabled = true
maxretry = 3
bantime = 3600
F2B
systemctl restart fail2ban

# Optimizaciones
cat >> /etc/sysctl.conf << 'SYSCTL'
net.core.somaxconn = 65535
vm.swappiness = 10
SYSCTL
sysctl -p 2>/dev/null || true

# Directorio
mkdir -p /opt/joinly
chown -R joinly:joinly /opt/joinly

echo ""
echo "[OK] Servidor configurado"
echo ""
echo "Próximos pasos:"
echo "  1. git clone <repo> /opt/joinly"
echo "  2. cp .env.prod.example .env.prod && nano .env.prod"
echo "  3. ./scripts/deploy.sh --build"
echo "  4. ./scripts/init-ssl.sh"
