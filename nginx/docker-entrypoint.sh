#!/bin/sh
set -e

# Substituir variables de entorno en nginx.conf
envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Ejecutar el comando por defecto
exec "$@"
