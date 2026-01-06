#!/bin/sh
# =============================================================================
# Joinly Nginx - Docker Entrypoint
# =============================================================================
set -e

DOMAIN="${DOMAIN:-localhost}"
LETSENCRYPT_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
LETSENCRYPT_KEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"
SSL_DIR="/etc/nginx/ssl"
SSL_CERT="$SSL_DIR/nginx.crt"
SSL_KEY="$SSL_DIR/nginx.key"

# Procesar template
if [ -f /etc/nginx/nginx.conf.template ]; then
    envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

# Configurar SSL: Let's Encrypt > autofirmados > generar
if [ -f "$LETSENCRYPT_CERT" ] && [ -f "$LETSENCRYPT_KEY" ]; then
    echo "[INFO] Usando certificados Let's Encrypt"
elif [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    echo "[INFO] Usando certificados autofirmados"
    sed -i "s|ssl_certificate .*|ssl_certificate $SSL_CERT;|g" /etc/nginx/nginx.conf
    sed -i "s|ssl_certificate_key .*|ssl_certificate_key $SSL_KEY;|g" /etc/nginx/nginx.conf
else
    echo "[INFO] Generando certificados autofirmados..."
    mkdir -p "$SSL_DIR"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_KEY" -out "$SSL_CERT" \
        -subj "/CN=$DOMAIN/O=Joinly/C=ES" 2>/dev/null
    chmod 644 "$SSL_CERT" "$SSL_KEY"
    sed -i "s|ssl_certificate .*|ssl_certificate $SSL_CERT;|g" /etc/nginx/nginx.conf
    sed -i "s|ssl_certificate_key .*|ssl_certificate_key $SSL_KEY;|g" /etc/nginx/nginx.conf
fi

nginx -t
exec "$@"
