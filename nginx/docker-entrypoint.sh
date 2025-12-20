#!/bin/sh
set -e

# Substituir variables de entorno en nginx.conf
envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# (Certificados SSL se crean en tiempo de Let's Encrypt)
# No se intenta crear certificados dummy aquí

# Ejecutar el comando por defecto
exec "$@"
