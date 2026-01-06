#!/usr/bin/env bash
# =============================================================================
# Joinly - Let's Encrypt SSL Setup
# =============================================================================
# Uso: ./scripts/init-ssl.sh [--auto]
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=".env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
AUTO=false

[[ "${1:-}" == "--auto" ]] && AUTO=true

[ -f "$ENV_FILE" ] || { echo "[ERROR] $ENV_FILE no encontrado"; exit 1; }
source "$ENV_FILE"

[[ -z "${DOMAIN:-}" || "$DOMAIN" == *"example"* ]] && { echo "[ERROR] DOMAIN no configurado"; exit 1; }
[[ -z "${LETSENCRYPT_EMAIL:-}" || "$LETSENCRYPT_EMAIL" == *"example"* ]] && { echo "[ERROR] LETSENCRYPT_EMAIL no configurado"; exit 1; }

echo "=== SSL Let's Encrypt ==="
echo "Dominio: $DOMAIN"
echo "Email: $LETSENCRYPT_EMAIL"

if [ "$AUTO" = false ]; then
    read -p "¿Continuar? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
fi

# Asegurar servicios levantados
docker compose -f "$COMPOSE_FILE" up -d mysql backend nginx 2>/dev/null || true
sleep 10

# Obtener certificado
echo "[INFO] Obteniendo certificado..."
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
    --webroot -w /var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" \
    --agree-tos --no-eff-email \
    --force-renewal \
    -d "$DOMAIN" -d "www.$DOMAIN"

# Reiniciar nginx
docker compose -f "$COMPOSE_FILE" restart nginx

echo ""
echo "[OK] SSL configurado: https://$DOMAIN"
echo "Los certificados se renuevan automáticamente"
