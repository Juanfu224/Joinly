# Guía de Despliegue en Producción - Joinly

Documentación completa para desplegar la aplicación Joinly en un servidor de producción con Docker, Nginx, MySQL y certificados SSL de Let's Encrypt.

## Requisitos Previos

### Sistema Operativo
- Ubuntu Server 20.04 LTS o superior
- Debian 11 o superior
- Acceso root o sudo

### Hardware Mínimo
- 2 GB RAM
- 2 vCPU
- 20 GB almacenamiento
- Conexión a internet

### Software Necesario
- Docker Engine 20.10 o superior
- Docker Compose 2.0 o superior
- Git
- OpenSSL

### Dominio y DNS
- Nombre de dominio registrado
- Registro DNS tipo A apuntando al servidor
- Puertos 80 y 443 abiertos en el firewall

## Configuración del Servidor

### 1. Actualización del Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalación de Docker

```bash
# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Agregar clave GPG oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio de Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### 3. Configuración de Usuario

```bash
# Crear usuario para la aplicación
sudo useradd -m -s /bin/bash joinly
sudo usermod -aG docker joinly

# Crear directorio de la aplicación
sudo mkdir -p /opt/joinly
sudo chown joinly:joinly /opt/joinly
```

### 4. Configuración del Firewall

```bash
# Instalar UFW
sudo apt install -y ufw

# Configurar reglas
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Activar firewall
sudo ufw --force enable
sudo ufw status
```

## Despliegue de la Aplicación

### 1. Clonar el Repositorio

```bash
# Cambiar al usuario joinly
sudo su - joinly

# Clonar el proyecto
cd /opt/joinly
git clone https://github.com/Juanfu224/Joinly.git .
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.prod.example .env.prod

# Editar configuración
nano .env.prod
```

Configurar las siguientes variables:

```env
# Dominio
DOMAIN=tu-dominio.com
LETSENCRYPT_EMAIL=tu-email@example.com

# Base de datos
MYSQL_ROOT_PASSWORD=<generar-contraseña-segura>
MYSQL_DATABASE=bbdd_joinly
MYSQL_USER=joinly_user
MYSQL_PASSWORD=<generar-contraseña-segura>

# JWT
JWT_SECRET_KEY=<generar-clave-base64>
JWT_ACCESS_TOKEN_EXPIRATION=2592000000
JWT_REFRESH_TOKEN_EXPIRATION=7776000000

# Encriptación
ENCRYPTION_KEY=<generar-clave-base64>
```

#### Generación de Claves Seguras

```bash
# MySQL Root Password
openssl rand -base64 32

# MySQL User Password
openssl rand -base64 32

# JWT Secret Key (64 bytes)
openssl rand -base64 64

# Encryption Key (32 bytes)
openssl rand -base64 32
```

### 3. Desplegar los Servicios

```bash
# Asegurar permisos de ejecución
chmod +x scripts/*.sh

# Ejecutar despliegue inicial
./scripts/deploy.sh --build
```

El script ejecutará automáticamente:
- Verificación de requisitos
- Generación de certificados SSL autofirmados temporales
- Backup de base de datos (si existe)
- Construcción de imágenes Docker
- Inicio de servicios
- Health checks
- Resumen del estado

### 4. Configurar Certificados SSL de Let's Encrypt

```bash
# Ejecutar script de inicialización SSL
./scripts/init-ssl.sh --auto
```

Este proceso:
- Verifica que los servicios estén corriendo
- Solicita certificados SSL a Let's Encrypt
- Configura nginx para usar los certificados
- Reinicia el servidor web
- Valida la configuración HTTPS

## Verificación del Despliegue

### 1. Verificar Estado de los Contenedores

```bash
docker compose -f docker-compose.prod.yml ps
```

Salida esperada:
```
NAME                  STATUS
joinly-backend-prod   Up (healthy)
joinly-mysql-prod     Up (healthy)
joinly-nginx-prod     Up (healthy)
joinly-certbot        Up
```

### 2. Verificar Certificado SSL

```bash
echo | openssl s_client -servername tu-dominio.com -connect tu-dominio.com:443 2>/dev/null | openssl x509 -noout -issuer -dates
```

### 3. Verificar Acceso Web

```bash
# Redirección HTTP a HTTPS
curl -I http://tu-dominio.com

# Respuesta HTTPS
curl -I https://tu-dominio.com

# Health check API
curl https://tu-dominio.com/actuator/health
```

### 4. Verificar Logs

```bash
# Logs de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f mysql
```

## Mantenimiento

### Actualización de la Aplicación

```bash
# Detener servicios
docker compose -f docker-compose.prod.yml down

# Actualizar código
git pull origin main

# Reconstruir y desplegar
./scripts/deploy.sh --build

# Configurar SSL si es necesario
./scripts/init-ssl.sh --auto
```

### Backup de Base de Datos

```bash
# Ejecutar backup manual
./scripts/backup.sh

# Los backups se guardan en: /opt/joinly/backups/
```

### Restaurar Base de Datos

```bash
# Restaurar desde backup
./scripts/restore.sh /opt/joinly/backups/joinly_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Renovación de Certificados SSL

Los certificados se renuevan automáticamente cada 12 horas mediante el servicio certbot.

Para renovación manual:

```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

### Limpieza de Recursos

```bash
# Limpiar imágenes no utilizadas
docker system prune -f

# Limpiar volúmenes huérfanos
docker volume prune -f
```

## Monitorización

### Uso de Recursos

```bash
# Ver uso de CPU y memoria
docker stats

# Ver uso de disco
df -h
du -sh /opt/joinly/*
```

### Estado de Servicios

```bash
# Health check completo
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50
```

## Solución de Problemas

### Nginx no Inicia

```bash
# Verificar logs
docker logs joinly-nginx-prod

# Verificar configuración
docker exec joinly-nginx-prod nginx -t

# Verificar certificados
docker exec joinly-nginx-prod ls -la /etc/letsencrypt/live/
docker exec joinly-nginx-prod ls -la /etc/nginx/ssl/
```

### Backend no Responde

```bash
# Verificar logs
docker logs joinly-backend-prod

# Verificar conectividad con MySQL
docker exec joinly-backend-prod nc -zv mysql 3306

# Verificar health check
curl http://localhost:8080/actuator/health
```

### MySQL no Inicia

```bash
# Verificar logs
docker logs joinly-mysql-prod

# Verificar espacio en disco
df -h

# Verificar permisos de volúmenes
docker volume inspect joinly-mysql-data
```

### Error de Certificados SSL

```bash
# Regenerar certificados autofirmados
cd /opt/joinly
rm -rf ssl/*
./scripts/deploy.sh

# Obtener nuevos certificados de Let's Encrypt
./scripts/init-ssl.sh --auto
```

## Seguridad

### Hardening del Servidor

```bash
# Deshabilitar login root por SSH
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Instalar fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Actualización de Dependencias

```bash
# Actualizar imágenes base
docker compose -f docker-compose.prod.yml pull

# Reconstruir con imágenes actualizadas
./scripts/deploy.sh --build --pull
```

### Rotación de Secretos

Cambiar periódicamente:
- Contraseñas de base de datos
- Claves JWT
- Claves de encriptación

Actualizar en `.env.prod` y reiniciar servicios:

```bash
docker compose -f docker-compose.prod.yml restart backend
```

## Arquitectura de Despliegue

### Servicios

| Servicio | Puerto Interno | Puerto Externo | Descripción |
|----------|----------------|----------------|-------------|
| nginx | 80, 443 | 80, 443 | Servidor web y proxy inverso |
| backend | 8080 | - | API REST Spring Boot |
| mysql | 3306 | - | Base de datos |
| certbot | - | - | Gestión de certificados SSL |

### Redes

- **joinly-internal**: Red interna para comunicación entre servicios (aislada)
- **joinly-external**: Red externa para acceso a internet (solo nginx)

### Volúmenes

- **joinly-mysql-data**: Datos persistentes de MySQL
- **joinly-backend-logs**: Logs del backend
- **joinly-nginx-logs**: Logs de nginx
- **joinly-certbot-conf**: Configuración de certificados
- **joinly-certbot-www**: Challenge de Let's Encrypt

## Referencias

### Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `scripts/deploy.sh` | Despliegue principal de la aplicación |
| `scripts/init-ssl.sh` | Configuración de SSL con Let's Encrypt |
| `scripts/backup.sh` | Backup de base de datos |
| `scripts/restore.sh` | Restauración de base de datos |
| `scripts/setup-server.sh` | Configuración automática del servidor |

### Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `.env.prod` | Variables de entorno de producción |
| `docker-compose.prod.yml` | Configuración de servicios Docker |
| `nginx/nginx.conf` | Configuración del servidor web |
| `backend/src/main/resources/application-prod.properties` | Configuración del backend |

## Soporte

Para reportar problemas o solicitar ayuda:

1. Revisar la documentación de seguridad: `docs/SECURITY.md`
2. Consultar issues en el repositorio: `https://github.com/Juanfu224/Joinly/issues`
3. Revisar logs de la aplicación para detalles del error

## Licencia

Este proyecto está bajo la licencia especificada en el archivo LICENSE del repositorio.
