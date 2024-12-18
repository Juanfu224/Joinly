# 🚀 Quick Start - Despliegue en Producción

Guía rápida para desplegar Joinly en un Droplet de Digital Ocean en menos de 15 minutos.

## ⚡ Pre-requisitos

- Droplet Ubuntu 24.04 (4GB RAM, 2 vCPU recomendado - $24/mes)
- Dominio apuntando al IP del droplet
- SSH key configurada

## 📝 Pasos Rápidos

### 1. Configurar Servidor (5 min)

```bash
# Conectar al droplet
ssh root@TU_IP_AQUI

# Ejecutar configuración automática
curl -fsSL https://raw.githubusercontent.com/tu-usuario/joinly/main/scripts/setup-server.sh | bash
```

### 2. Clonar y Configurar (5 min)

```bash
# Cambiar a usuario joinly
su - joinly

# Clonar proyecto
cd /opt && git clone https://github.com/tu-usuario/joinly.git
cd joinly

# Configurar variables
cp .env.prod.example .env.prod

# Generar claves
echo "JWT_SECRET_KEY=$(openssl rand -base64 64)" >> .env.prod
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env.prod
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)" >> .env.prod
echo "MYSQL_PASSWORD=$(openssl rand -base64 32)" >> .env.prod

# Editar configuración
nano .env.prod
# Configurar: DOMAIN, LETSENCRYPT_EMAIL, MYSQL_USER, DB_USERNAME, DB_PASSWORD
```

### 3. Desplegar (3 min)

```bash
# Dar permisos
chmod +x scripts/*.sh

# Desplegar
./scripts/deploy.sh --build
```

### 4. Configurar SSL (2 min)

```bash
# Esperar a que los servicios estén ready
docker compose -f docker-compose.prod.yml ps

# Configurar SSL
./scripts/init-ssl.sh
```

## ✅ Verificar

```bash
# Estado de servicios
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Test HTTP → HTTPS
curl -I http://tu-dominio.com

# Test HTTPS
curl -I https://tu-dominio.com
```

## 🎯 URLs

- **Frontend**: https://tu-dominio.com
- **API**: https://tu-dominio.com/api
- **Health**: https://tu-dominio.com/api/actuator/health

## 🔧 Comandos Útiles

```bash
# Ver estado
docker compose -f docker-compose.prod.yml ps

# Reiniciar
./scripts/deploy.sh --restart

# Ver logs
docker compose -f docker-compose.prod.yml logs -f backend

# Backup
./scripts/backup.sh

# Actualizar
git pull && ./scripts/deploy.sh --build
```

## 🆘 Problemas Comunes

### Error: "port already in use"
```bash
sudo lsof -i :80
sudo lsof -i :443
# Matar proceso si es necesario
```

### SSL no funciona
```bash
# Verificar DNS
dig +short tu-dominio.com

# Debe mostrar el IP del droplet
# Esperar propagación DNS (5-30 min)
```

### Backend no arranca
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs backend

# Verificar variables
docker compose -f docker-compose.prod.yml exec backend env | grep DB_
```

## 📚 Documentación Completa

Para instrucciones detalladas: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Tiempo total estimado: 15 minutos**
