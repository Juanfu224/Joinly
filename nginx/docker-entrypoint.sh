#!/bin/sh
set -e

# Si existe template, procesarlo. Si no, usar nginx.conf directamente
if [ -f "/etc/nginx/nginx.conf.template" ]; then
    # Substituir variables de entorno en nginx.conf
    envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

# (Certificados SSL se crean en tiempo de Let's Encrypt)
# No se intenta crear certificados dummy aquí

# Ejecutar el comando por defecto
exec "$@"
