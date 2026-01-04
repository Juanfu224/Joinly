#!/bin/sh
# =============================================================================
# Joinly Nginx - Docker Entrypoint
# =============================================================================
# Gestiona certificados SSL y procesa la configuración de nginx
# Prioridad: Let's Encrypt > Certificados autofirmados
# =============================================================================

set -e

DOMAIN="${DOMAIN:-localhost}"
LETSENCRYPT_DIR="/etc/letsencrypt/live/$DOMAIN"
SSL_DIR="/etc/nginx/ssl"
SSL_CERT="$SSL_DIR/nginx.crt"
SSL_KEY="$SSL_DIR/nginx.key"

# -----------------------------------------------------------------------------
# Generar certificados SSL autofirmados si no hay ninguno disponible
# -----------------------------------------------------------------------------
generate_self_signed_cert() {
    echo "[INFO] Generando certificados SSL autofirmados..."
    
    mkdir -p "$SSL_DIR"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_KEY" \
        -out "$SSL_CERT" \
        -subj "/CN=$DOMAIN/O=Joinly/C=ES" \
        2>/dev/null
    
    chmod 644 "$SSL_CERT" "$SSL_KEY"
    
    echo "[INFO] Certificados SSL autofirmados generados para: $DOMAIN"
}

# -----------------------------------------------------------------------------
# Configurar los certificados SSL a usar
# -----------------------------------------------------------------------------
configure_ssl() {
    # Verificar si existen certificados de Let's Encrypt
    if [ -f "$LETSENCRYPT_DIR/fullchain.pem" ] && [ -f "$LETSENCRYPT_DIR/privkey.pem" ]; then
        echo "[INFO] Usando certificados de Let's Encrypt desde $LETSENCRYPT_DIR"
        return 0
    fi
    
    echo "[WARNING] Certificados de Let's Encrypt no encontrados en $LETSENCRYPT_DIR"
    
    # Verificar si existen certificados autofirmados
    if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
        echo "[INFO] Usando certificados autofirmados desde $SSL_DIR"
        sed -i "s|ssl_certificate .*|ssl_certificate $SSL_CERT;|g" /etc/nginx/nginx.conf
        sed -i "s|ssl_certificate_key .*|ssl_certificate_key $SSL_KEY;|g" /etc/nginx/nginx.conf
        return 0
    fi
    
    # No hay certificados, generar autofirmados
    echo "[WARNING] No se encontraron certificados SSL, generando autofirmados..."
    generate_self_signed_cert
    
    sed -i "s|ssl_certificate .*|ssl_certificate $SSL_CERT;|g" /etc/nginx/nginx.conf
    sed -i "s|ssl_certificate_key .*|ssl_certificate_key $SSL_KEY;|g" /etc/nginx/nginx.conf
}

# -----------------------------------------------------------------------------
# Procesar template de configuración de Nginx
# -----------------------------------------------------------------------------
if [ -f "/etc/nginx/nginx.conf.template" ]; then
    echo "[INFO] Procesando template de configuración de Nginx..."
    envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
    echo "[INFO] Configuración de Nginx procesada correctamente"
fi

# Configurar SSL
configure_ssl

# Verificar configuración de nginx
echo "[INFO] Verificando configuración de Nginx..."
nginx -t

# -----------------------------------------------------------------------------
# Ejecutar comando principal
# -----------------------------------------------------------------------------
exec "$@"
