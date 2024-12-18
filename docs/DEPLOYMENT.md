# 🚀 Guía de Despliegue en Producción - Digital Ocean

Esta guía detalla el proceso completo para desplegar Joinly en un Droplet de Digital Ocean.

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Crear Droplet en Digital Ocean](#crear-droplet-en-digital-ocean)
3. [Configurar Dominio](#configurar-dominio)
4. [Configurar el Servidor](#configurar-el-servidor)
5. [Desplegar la Aplicación](#desplegar-la-aplicación)
6. [Configurar SSL](#configurar-ssl)
7. [Mantenimiento](#mantenimiento)
8. [Troubleshooting](#troubleshooting)

---

## 📌 Requisitos Previos

### En tu máquina local:
- Git instalado
- Acceso SSH configurado

### Recursos necesarios:
- Cuenta en Digital Ocean
- Dominio propio (ej: `joinly.app`)
- Email válido para Let's Encrypt

### Especificaciones mínimas del Droplet:
| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disco | 25 GB SSD | 50 GB SSD |
| SO | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

---

## 🌊 Crear Droplet en Digital Ocean

### Paso 1: Crear nuevo Droplet

1. Ir a [Digital Ocean](https://cloud.digitalocean.com)
2. Click en **Create** → **Droplets**
3. Configurar:
   - **Region**: Seleccionar la más cercana a tus usuarios (ej: Frankfurt para España)
   - **Image**: Ubuntu 24.04 LTS x64
   - **Size**: Basic → Regular → 4GB / 2 vCPUs ($24/mes recomendado)
   - **Authentication**: SSH Key (recomendado) o Password
   - **Hostname**: `joinly-prod`

### Paso 2: Configurar SSH Key (si no existe)

```bash
# Generar SSH key en tu máquina local
ssh-keygen -t ed25519 -C "tu@email.com"

# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub
```

Pegar la clave en Digital Ocean al crear el Droplet.

### Paso 3: Obtener IP del Droplet

Una vez creado, anotar la **IP pública** (ej: `167.99.123.45`)

---

## 🌐 Configurar Dominio

### Opción A: Usar dominios de Digital Ocean

1. En Digital Ocean → **Networking** → **Domains**
2. Añadir tu dominio
3. Crear registros DNS:

```
Tipo    Hostname    Valor               TTL
A       @           167.99.123.45       3600
A       www         167.99.123.45       3600
```

### Opción B: Usar tu proveedor de DNS

Configurar en tu proveedor (Cloudflare, GoDaddy, etc.):

```
Tipo    Nombre      Contenido           TTL
A       @           167.99.123.45       Auto
A       www         167.99.123.45       Auto
```

> ⏳ Los cambios DNS pueden tardar hasta 48h en propagarse (normalmente 5-30 min)

---

## ⚙️ Configurar el Servidor

### Paso 1: Conectar al servidor

```bash
ssh root@167.99.123.45
```

### Paso 2: Ejecutar script de configuración

```bash
# Descargar y ejecutar script de setup
curl -sSL https://raw.githubusercontent.com/tu-usuario/joinly/main/scripts/setup-server.sh | bash
```

O manualmente:

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose plugin
apt install docker-compose-plugin -y

# Crear usuario para la app
useradd -m -s /bin/bash joinly
usermod -aG docker joinly

# Configurar firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

### Paso 3: Clonar repositorio

```bash
# Cambiar al usuario joinly
su - joinly

# Crear directorio
mkdir -p /opt/joinly
cd /opt/joinly

# Clonar repositorio
git clone https://github.com/tu-usuario/joinly.git .
```

---

## 🚀 Desplegar la Aplicación

### Paso 1: Configurar variables de entorno

```bash
cd /opt/joinly

# Copiar template
cp .env.prod.example .env.prod

# Editar configuración
nano .env.prod
```

**Configuración obligatoria en `.env.prod`:**

```bash
# Dominio (SIN https://)
DOMAIN=joinly.tudominio.com

# Email para Let's Encrypt
LETSENCRYPT_EMAIL=tu@email.com

# Generar contraseñas seguras
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_PASSWORD=$(openssl rand -base64 32)

# Generar claves
JWT_SECRET_KEY=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

**Comandos para generar claves:**

```bash
# JWT Secret (copiar output a .env.prod)
openssl rand -base64 64

# Encryption Key
openssl rand -base64 32

# MySQL Password
openssl rand -base64 32
```

### Paso 2: Dar permisos a scripts

```bash
chmod +x scripts/*.sh
```

### Paso 3: Desplegar

```bash
# Primer despliegue (construye imágenes)
./scripts/deploy.sh --build

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f
```

### Paso 4: Verificar servicios

```bash
# Ver estado de contenedores
docker compose -f docker-compose.prod.yml ps

# Verificar que todo está healthy
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
```

---

## 🔒 Configurar SSL

### Paso 1: Verificar DNS

Antes de continuar, asegúrate de que el dominio apunta al servidor:

```bash
# Debe mostrar la IP del droplet
dig +short joinly.tudominio.com
```

### Paso 2: Obtener certificado SSL

```bash
./scripts/init-ssl.sh
```

El script:
1. Levanta los servicios sin SSL
2. Obtiene certificado de Let's Encrypt
3. Configura Nginx con SSL
4. Habilita renovación automática

### Paso 3: Verificar SSL

```bash
# Test de redirección HTTP → HTTPS
curl -I http://joinly.tudominio.com

# Test de HTTPS
curl -I https://joinly.tudominio.com
```

---

## 🔧 Mantenimiento

### Actualizar aplicación

```bash
cd /opt/joinly

# Obtener cambios
git pull origin main

# Redesplegar
./scripts/deploy.sh --build
```

### Backups

```bash
# Backup manual
./scripts/backup.sh

# Ver backups existentes
ls -la backups/
```

### Restaurar backup

```bash
./scripts/restore.sh backups/joinly_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Configurar backups automáticos (cron)

```bash
# Editar crontab
crontab -e

# Añadir línea para backup diario a las 3:00 AM
0 3 * * * /opt/joinly/scripts/backup.sh >> /var/log/joinly-backup.log 2>&1
```

### Ver logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs

# Servicio específico
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs nginx

# En tiempo real
docker compose -f docker-compose.prod.yml logs -f backend
```

### Reiniciar servicios

```bash
# Reiniciar todo
./scripts/deploy.sh --restart

# Reiniciar servicio específico
docker compose -f docker-compose.prod.yml restart backend
```

### Monitorear recursos

```bash
# Uso de recursos de contenedores
docker stats

# Espacio en disco
df -h

# Memoria
free -h
```

---

## 🐛 Troubleshooting

### El backend no arranca

```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs backend

# Verificar variables de entorno
docker compose -f docker-compose.prod.yml exec backend env | grep -E "DB_|JWT_"

# Verificar conexión a MySQL
docker compose -f docker-compose.prod.yml exec backend curl -f http://mysql:3306 || echo "MySQL no accesible"
```

### Problemas de SSL

```bash
# Verificar certificados
ls -la /var/lib/docker/volumes/joinly-certbot-conf/_data/live/

# Renovar manualmente
docker compose -f docker-compose.prod.yml run --rm certbot renew

# Ver logs de certbot
docker compose -f docker-compose.prod.yml logs certbot
```

### Error "port already in use"

```bash
# Ver qué usa el puerto 80
sudo lsof -i :80

# Ver qué usa el puerto 443
sudo lsof -i :443

# Matar proceso si es necesario
sudo kill -9 <PID>
```

### Limpiar recursos Docker

```bash
# Limpiar contenedores parados, imágenes no usadas, etc.
docker system prune -a

# Limpiar volúmenes no usados (¡CUIDADO! No usar si hay datos importantes)
docker volume prune
```

### Base de datos corrupta

```bash
# 1. Detener servicios
docker compose -f docker-compose.prod.yml down

# 2. Restaurar último backup
./scripts/restore.sh backups/joinly_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Reiniciar
./scripts/deploy.sh
```

---

## 📊 Arquitectura de Producción

```
                    ┌─────────────────────────────────────────┐
                    │            INTERNET                      │
                    └─────────────────┬───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │         NGINX (Reverse Proxy)            │
                    │         - SSL/TLS termination            │
                    │         - Rate limiting                  │
                    │         - Gzip compression               │
                    │         Puertos: 80, 443                 │
                    └─────────────────┬───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │    FRONTEND     │     │    BACKEND      │     │    CERTBOT      │
    │    (Angular)    │     │  (Spring Boot)  │     │  (Let's Encrypt)│
    │  Puerto: 4200   │     │  Puerto: 8080   │     │                 │
    └─────────────────┘     └────────┬────────┘     └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │     MYSQL       │
                            │   Puerto: 3306  │
                            │  (solo interno) │
                            └─────────────────┘
```

### Redes Docker

| Red | Tipo | Servicios |
|-----|------|-----------|
| `joinly-internal` | bridge (internal) | mysql, backend, frontend, nginx |
| `joinly-external` | bridge | nginx |

### Volúmenes

| Volumen | Descripción |
|---------|-------------|
| `joinly-mysql-data` | Datos de MySQL |
| `joinly-backend-logs` | Logs del backend |
| `joinly-nginx-logs` | Logs de Nginx |
| `joinly-certbot-conf` | Certificados SSL |
| `joinly-certbot-www` | Challenge ACME |

---

## 💰 Costos Estimados (Digital Ocean)

| Recurso | Especificación | Costo/mes |
|---------|----------------|-----------|
| Droplet | 4GB RAM, 2 vCPU | $24 |
| Dominio | .com | ~$12/año |
| **Total** | | **~$25/mes** |

---

## 🔐 Checklist de Seguridad

- [ ] SSH Key configurada (no usar contraseñas)
- [ ] Firewall activo (solo puertos 22, 80, 443)
- [ ] Fail2ban configurado
- [ ] Todas las contraseñas generadas con openssl
- [ ] Variables de entorno NO en Git
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Swagger UI deshabilitado en producción (opcional)
- [ ] Actualizaciones de seguridad del sistema

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker compose -f docker-compose.prod.yml logs`
2. Consulta la sección de [Troubleshooting](#troubleshooting)
3. Abre un issue en el repositorio

---

*Última actualización: Diciembre 2024*
