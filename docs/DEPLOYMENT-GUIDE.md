# Guía de Despliegue en Producción - Joinly

Esta guía documenta el proceso completo de despliegue en producción según el punto 6 del plan de implementación.

## Requisitos del Servidor

- Ubuntu 22.04+ LTS
- Docker 24+ y Docker Compose 2+
- Puertos 80, 443 abiertos
- 2GB RAM mínimo (recomendado 4GB)
- 20GB espacio en disco

## Preparación del Servidor (6.1)

### 1. Ejecutar setup-server.sh

```bash
sudo ./scripts/setup-server.sh
```

Este script configura:
- Docker y Docker Compose
- Firewall UFW (puertos 22, 80, 443)
- Fail2ban para protección SSH
- Usuario `joinly` con permisos docker
- Optimizaciones del kernel

### 2. Configurar Variables de Entorno

Copiar y editar `.env.prod`:

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

**IMPORTANTE:** Generar claves seguras:

```bash
# JWT Secret Key (64 bytes)
openssl rand -base64 64

# Encryption Key (32 bytes)
openssl rand -base64 32

# MySQL Password (32 bytes)
openssl rand -base64 32
```

## Docker Build y Push (6.2)

### 1. Build Local (Opcional)

```bash
./scripts/build-prod.sh --all --analyze
```

Este script:
- Compila frontend (Angular 21)
- Compila backend (Spring Boot 4)
- Genera análisis de bundles

### 2. Verificar Tamaños de Imágenes

```bash
docker images | grep joinly
```

Objetivos:
- Frontend (nginx): <100MB
- Backend (JRE): <250MB

## Despliegue en Producción (6.3)

### Opción A: Despliegue Local

```bash
./scripts/deploy.sh --build
```

### Opción B: Despliegue Remoto

```bash
./scripts/quick-deploy.sh root@tu-servidor.com /opt/joinly
```

Este script:
- Copia código al servidor
- Configura variables de entorno
- Ejecuta setup-server.sh si es necesario
- Despliega servicios
- Configura SSL con Let's Encrypt
- Ejecuta health-checks

## Configuración Nginx (6.4)

### 6.4.1 Reverse Proxy

El archivo `nginx/nginx.conf` configura:
- Proxy `/api/*` → `http://backend:8080`
- Servir frontend estático
- SPA fallback: todas las rutas → `index.html`

### 6.4.2 HTTPS

El script `init-ssl.sh` configura:
- Certificados Let's Encrypt
- Renovación automática (via certbot)
- Redirect HTTP → HTTPS
- HSTS header

```bash
./scripts/init-ssl.sh
```

### 6.4.3 Compresión

Nginx comprime automáticamente:
- text/html
- text/css
- application/json
- application/javascript
- image/svg+xml

### 6.4.4 Caché

Configuración de caché en `nginx/nginx.conf`:
- Assets estáticos: `expires 1y`
- Cache-Control: `public, immutable`
- Uploads: `expires 1d`

## Verificación Post-Despliegue (6.5)

### Ejecutar Verificación Completa

```bash
./scripts/verify-deploy.sh --full
```

Este script verifica:

#### 6.5.1 Rutas del Frontend

- Landing page: `https://joinly.studio`
- Login: `https://joinly.studio/auth/login`
- Dashboard: `https://joinly.studio/dashboard`
- 404 redirige correctamente

#### 6.5.2 Llamadas HTTP

- `POST /api/v1/auth/login` → 200/400/401
- `GET /api/v1/unidades` → 401 (sin token)
- CORS headers presentes
- `GET /actuator/health` → 200

#### 6.5.3 Redirects SPA

- Deep links funcionan (ej: `/grupo/123`)
- Refresh en cualquier ruta → no 404

#### 6.5.4 SSL/TLS

- Certificado válido
- HTTP → HTTPS redirect
- HSTS header activo

### Verificar Servicios Activos

```bash
docker ps
docker compose -f docker-compose.prod.yml logs
```

### Health Check

```bash
./scripts/health-check.sh
```

## Scripts de Mantenimiento

### Backup de Base de Datos

```bash
# Backup manual
./scripts/backup.sh --keep 7

# Backup automático (cron)
0 3 * * * /opt/joinly/scripts/backup.sh --keep 7 --quiet
```

### Rotación de Logs

```bash
# Rotación manual
./scripts/rotate-logs.sh

# Rotación automática (cron)
0 2 * * * /opt/joinly/scripts/rotate-logs.sh --quiet
```

### Rollback en caso de Error

```bash
# Rollback completo
./scripts/rollback.sh

# Rollback con backup específico
./scripts/rollback.sh --backup backups/joinly_20240126_120000.sql.gz
```

## Comandos Útiles

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo un servicio
docker compose -f docker-compose.prod.yml logs -f backend

# Últimos 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Reiniciar Servicios

```bash
# Reiniciar todos
docker compose -f docker-compose.prod.yml restart

# Reiniciar uno específico
docker compose -f docker-compose.prod.yml restart backend
```

### Actualizar Aplicación

```bash
# Actualizar desde Git
git pull

# Desplegar con nuevos cambios
./scripts/deploy.sh --build
```

### Ver Estado

```bash
# Estado de contenedores
docker compose -f docker-compose.prod.yml ps

# Estado de health checks
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
```

## Troubleshooting

### Los servicios no inician

```bash
# Ver logs de errores
docker compose -f docker-compose.prod.yml logs

# Verificar variables de entorno
cat .env.prod

# Verificar que Docker funciona
docker info
```

### Error de conexión a base de datos

```bash
# Verificar que MySQL está corriendo
docker ps | grep mysql

# Ver logs de MySQL
docker logs joinly-mysql-prod

# Verificar credenciales en .env.prod
```

### HTTPS no funciona

```bash
# Verificar certificados
docker exec joinly-nginx-prod ls -la /etc/letsencrypt/live/

# Verificar configuración SSL
docker exec joinly-nginx-prod nginx -t

# Reconfigurar SSL
./scripts/init-ssl.sh --renew
```

### El frontend carga pero la API no responde

```bash
# Verificar que el backend está corriendo
docker ps | grep backend

# Ver health check del backend
curl http://localhost:8080/actuator/health

# Verificar logs del backend
docker logs joinly-backend-prod
```

## Métricas de Éxito

| Métrica | Objetivo | Cómo Verificar |
|---------|----------|-----------------|
| Build sin errores | 0 errores | `docker compose build` |
| Imágenes Docker | <100MB (nginx), <250MB (backend) | `docker images` |
| Health checks | Todos healthy | `./scripts/health-check.sh` |
| HTTPS | Funcionando | `curl -I https://tu-dominio.com` |
| Rutas SPA | 200 OK | `./scripts/verify-deploy.sh` |
| SSL válido | >30 días | `docker exec joinly-nginx-prod openssl x509 -enddate -noout` |

## Checklist Pre-Producción

- [ ] Variables de entorno configuradas con valores seguros
- [ ] JWT_SECRET_KEY generado con `openssl rand -base64 64`
- [ ] ENCRYPTION_KEY generado con `openssl rand -base64 32`
- [ ] MYSQL_PASSWORD generada con `openssl rand -base64 32`
- [ ] DNS configurado (dominio apunta a IP del servidor)
- [ ] Puertos 80, 443 abiertos en firewall
- [ ] Certificado SSL configurado con Let's Encrypt
- [ ] Health checks pasan
- [ ] Verificación post-despliegue completa
- [ ] Backup de base de datos configurado
- [ ] Scripts de mantenimiento configurados (cron)

## Contacto

Para cualquier problema durante el despliegue, revisar:
- Logs: `docker compose -f docker-compose.prod.yml logs -f`
- Health check: `./scripts/health-check.sh`
- Documentación: `docs/DEPLOYMENT.md`
