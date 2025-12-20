#!/bin/sh
set -e

# Substituir variables de entorno en nginx.conf
envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Crear certificados dummy si no existen
DOMAIN=${DOMAIN:-localhost}
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=ES/ST=State/L=City/O=Organization/CN=$DOMAIN" 2>/dev/null || true
    cp "$CERT_DIR/fullchain.pem" "$CERT_DIR/chain.pem"
fi

# Ejecutar el comando por defecto
exec "$@"
