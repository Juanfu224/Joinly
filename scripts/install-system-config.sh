#!/usr/bin/env bash
# =============================================================================
# Joinly - Install System Configuration
# =============================================================================
# Este script instala configuraciones del sistema para producción:
#   - logrotate para logs del sistema
#   - cron jobs para tareas automáticas
#   - systemd services (si aplica)
#
# Uso: sudo ./scripts/install-system-config.sh
# =============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Verificar root
[ "$EUID" -ne 0 ] && { echo "[ERROR] Ejecutar como root: sudo $0"; exit 1; }

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="/opt/joinly"

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ⚙️  JOINLY SYSTEM CONFIG INSTALLER                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# =============================================================================
# 1. INSTALAR LOGROTATE
# =============================================================================
info "Instalando configuración de logrotate..."

if [ -f "config/logrotate.conf" ]; then
    cp config/logrotate.conf /etc/logrotate.d/joinly
    chown root:root /etc/logrotate.d/joinly
    chmod 644 /etc/logrotate.d/joinly
    ok "Logrotate configurado"
else
    warn "Archivo config/logrotate.conf no encontrado, omitiendo..."
fi

# =============================================================================
# 2. CONFIGURAR CRON JOBS
# =============================================================================
info "Configurando cron jobs para usuario joinly..."

CRON_FILE="/tmp/joinly-cron-$$"
cat > "$CRON_FILE" << 'EOF'
# Joinly - Cron Jobs
# Editar con: crontab -e -u joinly

# Backup diario de BD a las 3am
0 3 * * * cd /opt/joinly && ./scripts/backup.sh --keep 7 --quiet

# Rotación de logs diaria a las 2am
0 2 * * * cd /opt/joinly && ./scripts/rotate-logs.sh --quiet

# Health check cada 15 minutos
*/15 * * * * cd /opt/joinly && ./scripts/health-check.sh --json >> /var/log/joinly-health.log 2>&1 || true

# Renovar SSL semanalmente (redundante con certbot, pero seguro)
0 4 * * 0 cd /opt/joinly && docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet
EOF

# Instalar cron job
if id joinly &>/dev/null; then
    crontab -u joinly "$CRON_FILE"
    ok "Cron jobs configurados para usuario joinly"
    rm -f "$CRON_FILE"
else
    warn "Usuario joinly no encontrado, omitiendo cron jobs..."
    rm -f "$CRON_FILE"
fi

# =============================================================================
# 3. CREAR DIRECTORIOS DE LOGS
# =============================================================================
info "Creando directorios de logs del sistema..."

mkdir -p /var/log/joinly
chown joinly:joinly /var/log/joinly
chmod 755 /var/log/joinly

ok "Directorios de logs creados"

# =============================================================================
# 4. OPTIMIZAR KERNEL (opcional)
# =============================================================================
info "Optimizando configuración del kernel..."

# Solo agregar si no existen
if ! grep -q "net.core.somaxconn" /etc/sysctl.conf 2>/dev/null; then
    cat >> /etc/sysctl.conf << 'EOF'

# Joinly optimizations
net.core.somaxconn = 65535
vm.swappiness = 10
net.ipv4.tcp_tw_reuse = 1
fs.file-max = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.core.netdev_max_backlog = 16384
EOF

    sysctl -p 2>/dev/null || true
    ok "Kernel optimizado"
else
    ok "Kernel ya optimizado"
fi

# =============================================================================
# 5. VERIFICAR INSTALACIÓN
# =============================================================================
info "Verificando instalación..."

# Verificar logrotate
if [ -f "/etc/logrotate.d/joinly" ]; then
    ok "Logrotate: /etc/logrotate.d/joinly"
else
    warn "Logrotate no instalado"
fi

# Verificar cron jobs
if id joinly &>/dev/null; then
    if crontab -u joinly -l 2>/dev/null | grep -q "joinly"; then
        ok "Cron jobs configurados"
    else
        warn "Cron jobs no configurados"
    fi
fi

# Verificar directorios
if [ -d "/var/log/joinly" ]; then
    ok "Logs del sistema: /var/log/joinly"
fi

# =============================================================================
# RESUMEN
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✓ CONFIGURACIÓN DEL SISTEMA INSTALADA${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
if id joinly &>/dev/null && crontab -u joinly -l 2>/dev/null | grep -q "joinly"; then
    echo "  Cron jobs configurados:"
    echo "    - Backup diario a las 3am"
    echo "    - Rotación de logs a las 2am"
    echo "    - Health check cada 15 minutos"
    echo "    - Renovación SSL semanal"
else
    echo "  (no se instalaron cron jobs)"
fi
echo ""
echo "  Verificar:"
echo "    - Cron jobs: crontab -u joinly -l"
echo "    - Logrotate: cat /etc/logrotate.d/joinly"
echo "    - Logs: ls -la /var/log/joinly"
echo ""

exit 0
