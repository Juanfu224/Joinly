# 🚀 Guía de Despliegue Rápido - Joinly

**Despliega tu aplicación en 5 minutos con un solo comando.**

---

## 📋 Requisitos Previos

### En tu VPS:
- ✅ Ubuntu 22.04 LTS o superior
- ✅ Acceso SSH como root
- ✅ Mínimo 2GB RAM (recomendado 4GB)
- ✅ Puertos 80, 443 y 22 abiertos

### En tu máquina local:
- ✅ SSH configurado
- ✅ Git instalado

---

## ⚡ Despliegue Rápido (Un Solo Comando)

### Opción 1: Desde tu máquina local (Recomendado)

```bash
# 1. Habilitar acceso SSH en tu VPS desde el panel de control
# 2. Ejecutar el script de despliegue
./scripts/quick-deploy.sh root@159.89.1.100
```

### Opción 2: Directamente en el servidor

```bash
# Conecta a tu servidor
ssh root@159.89.1.100

# Ejecuta el script de despliegue automático
curl -sSL https://raw.githubusercontent.com/Juanfu224/Joinly/main/scripts/quick-deploy.sh | bash
```

**Eso es todo.** El script hará automáticamente:
- ✅ Instalar Docker y dependencias
- ✅ Configurar firewall
- ✅ Clonar el repositorio
- ✅ Generar contraseñas seguras
- ✅ Construir y desplegar la aplicación

---

## 🔧 Despliegue Manual (Paso a Paso)

Si prefieres control total, sigue estos pasos:

### 1️⃣ Configurar el Servidor

```bash
# Conectar al servidor
ssh root@159.89.1.100

# Ejecutar script de configuración
curl -sSL https://raw.githubusercontent.com/Juanfu224/Joinly/main/scripts/setup-server.sh | bash
```

### 2️⃣ Clonar el Repositorio

```bash
# Cambiar al usuario de la aplicación
su - joinly

# Clonar el proyecto
cd /opt/joinly
git clone https://github.com/Juanfu224/Joinly.git .
```

### 3️⃣ Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.prod.example .env.prod

# Generar contraseñas seguras
MYSQL_ROOT_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
MYSQL_USER_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Mostrar las contraseñas generadas (guárdalas en un lugar seguro)
echo "MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASS"
echo "MYSQL_USER_PASSWORD=$MYSQL_USER_PASS"
echo "JWT_SECRET_KEY=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"

# Editar el archivo .env.prod
nano .env.prod
```

**Reemplaza estos valores en `.env.prod`:**
```env
DOMAIN=159.89.1.100  # Tu IP o dominio
MYSQL_ROOT_PASSWORD=<MYSQL_ROOT_PASS>
MYSQL_PASSWORD=<MYSQL_USER_PASS>
DB_PASSWORD=<MYSQL_USER_PASS>
JWT_SECRET_KEY=<JWT_SECRET>
ENCRYPTION_KEY=<ENCRYPTION_KEY>
```

### 4️⃣ Desplegar la Aplicación

```bash
# Hacer scripts ejecutables
chmod +x scripts/*.sh

# Desplegar (primera vez)
./scripts/deploy.sh --build

# O usar make
make prod-deploy
```

### 5️⃣ Verificar el Despliegue

```bash
# Ver estado de contenedores
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar en el navegador
curl http://159.89.1.100
```

---

## 🔒 Configurar HTTPS con Let's Encrypt (Opcional)

**⚠️ Requiere un dominio configurado**

### 1. Configurar tu Dominio

En tu proveedor DNS (Cloudflare, GoDaddy, etc.):
```
Tipo    Nombre    Valor
A       @         159.89.1.100
A       www       159.89.1.100
```

### 2. Actualizar .env.prod

```bash
nano .env.prod
```

Cambiar:
```env
DOMAIN=tudominio.com
LETSENCRYPT_EMAIL=tu@email.com
```

### 3. Inicializar SSL

```bash
./scripts/init-ssl.sh
```

---

## 📊 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart

# Detener servicios
docker compose -f docker-compose.prod.yml down

# Actualizar aplicación
git pull origin main
./scripts/deploy.sh --build
```

### Backup y Restauración

```bash
# Crear backup
./scripts/backup.sh

# Restaurar backup
./scripts/restore.sh /path/to/backup.sql.gz
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f backend

# Verificar salud de servicios
docker compose -f docker-compose.prod.yml ps
```

---

## 🐛 Solución de Problemas

### El servidor no responde

```bash
# Verificar que los contenedores están corriendo
docker ps

# Verificar logs por errores
docker compose -f docker-compose.prod.yml logs --tail=100

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart
```

### Error de conexión a base de datos

```bash
# Verificar que MySQL está corriendo
docker ps | grep mysql

# Verificar logs de MySQL
docker compose -f docker-compose.prod.yml logs mysql

# Verificar variables de entorno
cat .env.prod | grep MYSQL
```

### Backend no inicia

```bash
# Ver logs del backend
docker compose -f docker-compose.prod.yml logs backend

# Verificar que el healthcheck pasa
docker inspect joinly-backend-prod | grep -A 10 Health

# Reconstruir imagen
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend
```

### Error de SSL/HTTPS

```bash
# Verificar que el dominio apunta al servidor
dig tudominio.com

# Verificar certificados
docker compose -f docker-compose.prod.yml exec certbot certbot certificates

# Renovar certificados manualmente
docker compose -f docker-compose.prod.yml exec certbot certbot renew --force-renewal
```

---

## 🔐 Checklist de Seguridad

Antes de ir a producción, verifica:

- [ ] Todas las contraseñas generadas son únicas y seguras
- [ ] El archivo `.env.prod` NO está en el repositorio
- [ ] Firewall configurado (solo puertos 22, 80, 443)
- [ ] Fail2ban activado para SSH
- [ ] Backups automáticos configurados
- [ ] Certificado SSL configurado (si tienes dominio)
- [ ] Variables CORS configuradas correctamente
- [ ] JWT tokens con expiración apropiada

---

## 📱 URLs de Acceso

Después del despliegue, tu aplicación estará disponible en:

- **Frontend**: `http://159.89.1.100` o `https://tudominio.com`
- **API**: `http://159.89.1.100/api` o `https://tudominio.com/api`
- **Swagger**: `http://159.89.1.100/swagger-ui/` o `https://tudominio.com/swagger-ui/`
- **Actuator**: `http://159.89.1.100/actuator/health`

---

## 🆘 Necesitas Ayuda?

1. **Revisa los logs**: `docker compose -f docker-compose.prod.yml logs -f`
2. **Verifica el estado**: `docker compose -f docker-compose.prod.yml ps`
3. **Consulta la documentación completa**: [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Revisa issues conocidos**: `docs/TODO.md`

---

## 📝 Notas Importantes

1. **Primera vez**: El primer despliegue puede tardar 5-10 minutos en construir todas las imágenes.
2. **Recursos**: Monitorea el uso de RAM/CPU con `docker stats`.
3. **Actualizaciones**: Usa `git pull && ./scripts/deploy.sh --build` para actualizar.
4. **Backups**: Configura backups automáticos antes de ir a producción.

---

**✨ ¡Tu aplicación ya está en producción! ✨**

Para más información detallada, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)
