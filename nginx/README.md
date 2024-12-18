# Nginx - Reverse Proxy Configuration

## 📁 Archivos

| Archivo | Descripción |
|---------|-------------|
| `nginx.conf` | Configuración principal con SSL (producción) |
| `nginx-initial.conf` | Configuración inicial (antes de obtener SSL) |
| `50x.html` | Página de error personalizada |

## 🔄 Flujo de Configuración

1. **Inicial** (`nginx-initial.conf`):
   - Se usa al inicio para obtener certificados
   - Solo HTTP, sin SSL
   - Permite ACME challenge de Let's Encrypt

2. **Producción** (`nginx.conf`):
   - Se activa después de obtener certificados
   - HTTPS con redirección desde HTTP
   - Security headers completos
   - Rate limiting configurado

## ⚙️ Variables de Entorno

La configuración usa `envsubst` para reemplazar variables:

- `${DOMAIN}` - Tu dominio (ej: `joinly.app`)

## 🔧 Uso

El docker-compose hace la sustitución automáticamente:

```yaml
command: >
  -c "envsubst '$$DOMAIN' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf &&
      cp /tmp/nginx.conf /etc/nginx/nginx.conf &&
      nginx -t &&
      nginx -g 'daemon off;'"
```

## 🧪 Probar Configuración

```bash
# Verificar sintaxis
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Recargar configuración
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Ver configuración activa
docker compose -f docker-compose.prod.yml exec nginx cat /etc/nginx/nginx.conf
```

## 🔒 Security Features

- ✅ TLS 1.2+ únicamente
- ✅ Strong cipher suites
- ✅ HSTS con preload
- ✅ OCSP Stapling
- ✅ Security headers (11 configurados)
- ✅ Rate limiting (general + auth)
- ✅ Request size limits
- ✅ Compresión gzip

## 📝 Personalización

### Habilitar Swagger en Producción

En `nginx.conf`, cambiar:

```nginx
location /swagger-ui/ {
    return 404;  # Comentar esta línea
    # Añadir configuración de proxy
}
```

### Ajustar Rate Limiting

```nginx
# En la sección http
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;  # Ajustar rate
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;     # Ajustar rate
```

### Configurar CSP

Descomentar y ajustar:

```nginx
add_header Content-Security-Policy "..." always;
```

## 🐛 Troubleshooting

### Ver logs

```bash
docker compose -f docker-compose.prod.yml logs nginx
```

### Certificados no encontrados

```bash
# Verificar certificados
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/

# Si no existen, ejecutar init-ssl.sh
./scripts/init-ssl.sh
```

### 502 Bad Gateway

```bash
# Verificar que backend está corriendo
docker compose -f docker-compose.prod.yml ps backend

# Verificar conectividad
docker compose -f docker-compose.prod.yml exec nginx wget -qO- http://backend:8080/actuator/health
```
