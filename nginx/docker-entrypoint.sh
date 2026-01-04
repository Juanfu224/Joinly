#!/bin/sh
set -e

# =============================================================================
# Joinly Nginx - Docker Entrypoint
# =============================================================================
# Genera certificados SSL autofirmados si no existen y procesa la configuración
# =============================================================================

SSL_DIR="/etc/nginx/ssl"
SSL_CERT="$SSL_DIR/nginx.crt"
SSL_KEY="$SSL_DIR/nginx.key"

# -----------------------------------------------------------------------------
# Generar certificados SSL autofirmados si no existen
# -----------------------------------------------------------------------------
generate_self_signed_cert() {
    echo "[INFO] Generando certificados SSL autofirmados..."
    
    # Crear directorio si no existe
    mkdir -p "$SSL_DIR"
    
    # Usar el dominio de la variable de entorno o localhost como fallback
    CERT_DOMAIN="${DOMAIN:-localhost}"
    
    # Generar certificado autofirmado válido por 365 días
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_KEY" \
        -out "$SSL_CERT" \
        -subj "/CN=$CERT_DOMAIN/O=Joinly/C=ES" \
        2>/dev/null
    
    # Ajustar permisos
    chmod 644 "$SSL_CERT"
    chmod 644 "$SSL_KEY"
    
    echo "[INFO] Certificados SSL autofirmados generados para: $CERT_DOMAIN"
}

# Verificar si existen certificados SSL válidos
if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
    echo "[WARNING] Certificados SSL no encontrados en $SSL_DIR"
    generate_self_signed_cert
else
    echo "[INFO] Certificados SSL encontrados en $SSL_DIR"
fi

# -----------------------------------------------------------------------------
# Procesar template de configuración de Nginx
# -----------------------------------------------------------------------------
if [ -f "/etc/nginx/nginx.conf.template" ]; then
    echo "[INFO] Procesando template de configuración de Nginx..."
    envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
    echo "[INFO] Configuración de Nginx procesada correctamente"
fi

# -----------------------------------------------------------------------------
# Ejecutar comando principal
# -----------------------------------------------------------------------------
exec "$@"
