# 🎯 INSTRUCCIONES PARA JUAN - Despliegue de Joinly

**Lee esto primero antes de hacer cualquier cosa.**

---

## ❗ SITUACIÓN ACTUAL

Tu servidor **159.89.1.100** está en línea pero **NO puedes acceder por SSH**.

```bash
$ ssh root@159.89.1.100
ssh: connect to host 159.89.1.100 port 22: Connection refused
```

**Esto es NORMAL** - El SSH simplemente no está habilitado aún.

---

## 🔧 PASO 1: HABILITAR SSH (5 MINUTOS)

### ¿Dónde está tu servidor?

Primero, identifica **dónde compraste el VPS**:
- [ ] Digital Ocean
- [ ] Vultr
- [ ] Linode
- [ ] Hetzner
- [ ] OVH
- [ ] Otro: _______________

### Acceder a la Consola Web

Cada proveedor tiene una **consola web** (terminal en el navegador):

#### Si es Digital Ocean:
1. Ve a https://cloud.digitalocean.com
2. Click en tu Droplet
3. Click en "Access" → "Launch Droplet Console"
4. Se abre una terminal en el navegador

#### Si es Vultr:
1. Ve a https://my.vultr.com
2. Click en tu servidor
3. Click en el icono de **monitor** (arriba a la derecha)
4. Se abre consola VNC

#### Si es otro proveedor:
- Busca: **"Console"**, **"Terminal Web"**, **"KVM"**, **"VNC"** o **"SSH en navegador"**

### Comandos en la Consola

Una vez dentro de la consola web, **copia y pega** estos comandos:

```bash
# 1. Actualizar el sistema
apt update

# 2. Instalar SSH
apt install -y openssh-server

# 3. Iniciar SSH
systemctl start ssh
systemctl enable ssh

# 4. Verificar que está corriendo
systemctl status ssh

# 5. Configurar firewall (si UFW está activo)
ufw allow ssh
ufw reload

# 6. Verificar puerto 22
ss -tulpn | grep :22
```

**Deberías ver:** `LISTEN 0 128 0.0.0.0:22`

### Probar desde tu PC

Abre una terminal en tu PC y prueba:

```bash
ssh root@159.89.1.100
```

Si pide contraseña, introdúcela. Si no la sabes:
- Está en el email de creación del VPS
- O en el panel de control del proveedor

**¿Funciona?** ✅ Continúa al PASO 2  
**¿No funciona?** 👉 Lee `docs/SSH_SETUP.md` para más ayuda

---

## 🚀 PASO 2: DESPLEGAR CON UN COMANDO (10 MINUTOS)

Una vez que SSH funcione, desde tu PC local:

```bash
# Ir al directorio del proyecto
cd ~/Documentos/DAW\ LOCAL/Proyecto/Joinly

# Ejecutar el despliegue
./scripts/quick-deploy.sh root@159.89.1.100
```

**Eso es todo.** El script hará:

1. ⏳ Conectar al servidor via SSH
2. ⏳ Instalar Docker y Docker Compose
3. ⏳ Configurar firewall
4. ⏳ Crear usuario `joinly`
5. ⏳ Clonar repositorio desde GitHub
6. ⏳ Generar contraseñas seguras
7. ⏳ Construir imágenes Docker
8. ⏳ Desplegar todos los contenedores
9. ✅ Mostrar URLs de acceso

**Tiempo:** 5-10 minutos (depende de conexión)

### Lo que verás

El script mostrará información de progreso:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         🚀  JOINLY - DESPLIEGUE RÁPIDO A PRODUCCIÓN          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

[PASO] 1/8 - Verificando sistema...
[✓] Sistema detectado: Ubuntu 24.04 LTS

[PASO] 2/8 - Actualizando sistema...
[✓] Sistema actualizado

[PASO] 3/8 - Instalando Docker...
[✓] Docker instalado: Docker version 24.0.7

...

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅  DESPLIEGUE COMPLETADO EXITOSAMENTE                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🌐 Tu aplicación está disponible en:
   http://159.89.1.100
```

### ⚠️ IMPORTANTE: Guarda las Credenciales

El script generará **contraseñas aleatorias seguras** y las mostrará. **CÓPIALAS**:

```
=== CREDENCIALES GENERADAS ===
MySQL Root:     xJ8kL3mN9pQ2rT5vW7yZ1aC4eF6hI
MySQL User:     bD9fG2hJ4kL6nP8qR1sT3uV5wX7yZ
JWT Secret:     aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aC9eF1gH3iJ5kL7
Encryption Key: mN7oP9qR1sT3uV5wX7yZ1aC3eF5gH
```

**Guárdalas en:**
- Gestor de contraseñas (1Password, Bitwarden, etc.)
- Archivo local seguro
- Nota cifrada

**También se guardan en el servidor en:**
- `/opt/joinly/.env.prod`
- `/opt/joinly/.env.prod.backup`

---

## ✅ PASO 3: VERIFICAR QUE FUNCIONA

### Abrir en el Navegador

1. Ve a: **http://159.89.1.100**
   - Deberías ver el frontend de Joinly

2. Ve a: **http://159.89.1.100/api**
   - Debería responder con algo de JSON

3. Ve a: **http://159.89.1.100/swagger-ui/**
   - Deberías ver la documentación de la API

### Verificar en Terminal

```bash
# Ver estado de contenedores
ssh root@159.89.1.100 "cd /opt/joinly && docker compose -f docker-compose.prod.yml ps"

# Ver logs
ssh root@159.89.1.100 "cd /opt/joinly && docker compose -f docker-compose.prod.yml logs --tail=50"
```

---

## 🌐 OPCIONAL: Configurar Dominio y HTTPS

Si tienes un dominio (ej: `joinly.app`):

### 1. Configurar DNS

En tu proveedor DNS (Cloudflare, GoDaddy, etc.):

```
Tipo    Nombre    Valor
A       @         159.89.1.100
A       www       159.89.1.100
```

### 2. Esperar Propagación DNS

```bash
# Verificar (desde tu PC)
dig joinly.app

# O en web:
# https://www.whatsmydns.net/
```

### 3. Actualizar .env.prod

```bash
# Conectar al servidor
ssh root@159.89.1.100

# Editar archivo
nano /opt/joinly/.env.prod

# Cambiar estas líneas:
# DOMAIN=joinly.app  (tu dominio real)
# LETSENCRYPT_EMAIL=tu@email.com
```

### 4. Configurar SSL

```bash
cd /opt/joinly
./scripts/init-ssl.sh
```

El script obtendrá certificados de Let's Encrypt y configurará HTTPS.

**Ahora tu sitio estará en:** `https://joinly.app`

---

## 📋 COMANDOS ÚTILES

### Ver Estado

```bash
ssh root@159.89.1.100 "cd /opt/joinly && docker compose -f docker-compose.prod.yml ps"
```

### Ver Logs

```bash
ssh root@159.89.1.100 "cd /opt/joinly && docker compose -f docker-compose.prod.yml logs -f"
```

### Reiniciar Servicios

```bash
ssh root@159.89.1.100 "cd /opt/joinly && docker compose -f docker-compose.prod.yml restart"
```

### Actualizar Código

```bash
ssh root@159.89.1.100 "cd /opt/joinly && git pull && ./scripts/deploy.sh --build"
```

### Crear Backup

```bash
ssh root@159.89.1.100 "cd /opt/joinly && ./scripts/backup.sh"
```

---

## 🆘 SI ALGO FALLA

### Error: "Connection refused" al ejecutar quick-deploy.sh

**Causa:** SSH aún no está habilitado  
**Solución:** Vuelve al PASO 1

### Error: "Permission denied (publickey)"

**Causa:** Estás usando clave SSH pero el servidor no la tiene  
**Solución:** Usa contraseña o configura tu clave SSH:

```bash
ssh-copy-id root@159.89.1.100
```

### Error al construir imágenes Docker

```bash
# Limpiar caché y reintentar
ssh root@159.89.1.100 "docker system prune -a -f && cd /opt/joinly && ./scripts/deploy.sh --build"
```

### Los contenedores no inician

```bash
# Ver qué está fallando
ssh root@159.89.1.100 "cd /opt/joinly && docker compose -f docker-compose.prod.yml logs"
```

### La página no carga

```bash
# Verificar que Nginx está corriendo
ssh root@159.89.1.100 "docker ps | grep nginx"

# Verificar puertos
ssh root@159.89.1.100 "netstat -tulpn | grep :80"
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles, lee estos documentos:

- **[QUICKSTART_DEPLOY.md](docs/QUICKSTART_DEPLOY.md)** - Guía completa paso a paso
- **[SSH_SETUP.md](docs/SSH_SETUP.md)** - Solución de problemas SSH
- **[DEPLOY_CHECKLIST.md](docs/DEPLOY_CHECKLIST.md)** - Lista de verificación
- **[DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md)** - Estado y comandos
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guía exhaustiva

---

## ✅ RESUMEN DE PASOS

1. **Habilitar SSH** (5 min)
   - Acceder a consola web del proveedor
   - Instalar y activar SSH
   - Probar conexión

2. **Desplegar** (10 min)
   - `./scripts/quick-deploy.sh root@159.89.1.100`
   - Guardar credenciales mostradas
   - Esperar a que termine

3. **Verificar** (2 min)
   - Abrir `http://159.89.1.100` en navegador
   - Comprobar que carga
   - Probar registro/login

4. **Opcional: HTTPS** (10 min)
   - Configurar DNS
   - Actualizar `.env.prod`
   - Ejecutar `./scripts/init-ssl.sh`

**TOTAL:** 15-30 minutos

---

## 💡 TIPS

- 📸 Haz capturas del proceso por si necesitas ayuda
- 📝 Guarda las credenciales en un lugar seguro
- 🔄 Si algo falla, vuelve a ejecutar el script (es idempotente)
- 📊 Monitorea los logs las primeras horas después del despliegue
- 💾 Configura backups automáticos después del primer despliegue

---

## ✨ SIGUIENTE NIVEL

Después de tener todo funcionando:

- [ ] Configurar backups automáticos (cron)
- [ ] Configurar monitoreo (UptimeRobot, etc.)
- [ ] Configurar alertas de email
- [ ] Optimizar rendimiento
- [ ] Implementar CI/CD con GitHub Actions

**¡Pero eso es para después! Primero lo básico.**

---

**¿Listo?** 🚀

1. Habilita SSH
2. Ejecuta `./scripts/quick-deploy.sh root@159.89.1.100`
3. Espera 10 minutos
4. **¡Disfruta tu app en producción!**

**¡Éxito!** 🎉

---

**Creado por:** GitHub Copilot  
**Para:** Juan  
**Proyecto:** Joinly  
**Fecha:** 20 de diciembre de 2025
