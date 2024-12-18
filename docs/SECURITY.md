# 🔒 Guía de Seguridad - Joinly

## 📋 Checklist de Seguridad Pre-Deploy

Antes de desplegar a producción, verifica:

### Aplicación

- [ ] Todas las claves secretas generadas con `openssl rand`
- [ ] JWT_SECRET_KEY único (mínimo 512 bits)
- [ ] ENCRYPTION_KEY único (256 bits)
- [ ] Contraseñas de MySQL únicas y fuertes
- [ ] CORS configurado solo para tu dominio
- [ ] Swagger UI deshabilitado en producción
- [ ] Variables de entorno NO en Git
- [ ] Actuator expone solo endpoint health

### Servidor

- [ ] Firewall UFW activo (solo puertos 22, 80, 443)
- [ ] Fail2ban configurado
- [ ] SSH con key (no contraseñas)
- [ ] Usuario no-root para la aplicación
- [ ] Sistema actualizado (`apt update && apt upgrade`)
- [ ] Backups automáticos configurados

### Docker

- [ ] Contenedores ejecutan como usuario no-root
- [ ] Red interna aislada
- [ ] Límites de recursos configurados
- [ ] Health checks en todos los servicios
- [ ] Volúmenes con permisos correctos
- [ ] Imágenes actualizadas

### SSL/TLS

- [ ] Certificado Let's Encrypt válido
- [ ] Renovación automática configurada
- [ ] Redirect HTTP → HTTPS activo
- [ ] HSTS headers configurados
- [ ] TLS 1.2+ únicamente

## 🛡️ Configuraciones de Seguridad

### 1. Usuarios y Permisos

```bash
# Verificar usuario de la app
id joinly

# Verificar permisos del proyecto
ls -la /opt/joinly

# Debe ser propiedad de joinly:joinly
sudo chown -R joinly:joinly /opt/joinly
```

### 2. Firewall

```bash
# Estado del firewall
sudo ufw status verbose

# Debe mostrar:
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

### 3. SSH Hardening

```bash
# Editar configuración SSH
sudo nano /etc/ssh/sshd_config

# Configuraciones recomendadas:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3

# Reiniciar SSH
sudo systemctl restart sshd
```

### 4. Fail2ban

```bash
# Estado de Fail2ban
sudo fail2ban-client status

# Ver IPs baneadas
sudo fail2ban-client status sshd

# Desbanear IP (si es necesario)
sudo fail2ban-client set sshd unbanip IP_ADDRESS
```

### 5. Docker Security

```bash
# Verificar que contenedores NO corren como root
docker compose -f docker-compose.prod.yml exec backend whoami
# Debe mostrar: joinly

docker compose -f docker-compose.prod.yml exec frontend whoami
# Debe mostrar: joinly

# Verificar redes
docker network ls
docker network inspect joinly-internal
# Debe tener "internal": true
```

## 🔐 Gestión de Secretos

### Generar Claves Seguras

```bash
# JWT Secret (512 bits)
openssl rand -base64 64

# Encryption Key (256 bits)
openssl rand -base64 32

# MySQL Password (256 bits)
openssl rand -base64 32

# Verificar entropía del sistema
cat /proc/sys/kernel/random/entropy_avail
# Debe ser > 1000
```

### Almacenamiento Seguro

**❌ NO HACER:**
- Hardcodear secretos en código
- Subir `.env` o `.env.prod` a Git
- Compartir secretos por email/chat
- Usar valores por defecto

**✅ HACER:**
- Usar variables de entorno
- Guardar backup de secretos en gestor de contraseñas (1Password, Bitwarden)
- Rotar secretos periódicamente
- Diferentes secretos por entorno

### Rotación de Claves

```bash
# 1. Generar nuevas claves
NEW_JWT_SECRET=$(openssl rand -base64 64)
NEW_ENCRYPTION_KEY=$(openssl rand -base64 32)

# 2. Actualizar .env.prod
nano .env.prod

# 3. Redesplegar
./scripts/deploy.sh --restart

# 4. Verificar funcionamiento
curl https://tu-dominio.com/api/actuator/health
```

## 🚨 Respuesta a Incidentes

### Si detectas acceso no autorizado:

1. **Cambiar todas las contraseñas inmediatamente**
   ```bash
   # Generar nuevas claves
   openssl rand -base64 64 > new-jwt.txt
   openssl rand -base64 32 > new-enc.txt
   openssl rand -base64 32 > new-mysql.txt
   ```

2. **Revisar logs**
   ```bash
   # Logs de acceso de Nginx
   docker compose -f docker-compose.prod.yml logs nginx | grep -E "401|403|500"
   
   # Logs del sistema
   sudo tail -f /var/log/auth.log
   ```

3. **Banear IPs sospechosas**
   ```bash
   sudo fail2ban-client set sshd banip IP_SOSPECHOSA
   sudo ufw deny from IP_SOSPECHOSA
   ```

4. **Crear backup de emergencia**
   ```bash
   ./scripts/backup.sh
   ```

5. **Notificar al equipo**

## 🔍 Auditoría de Seguridad

### Escaneo de Vulnerabilidades

```bash
# Escanear imágenes Docker
docker scan joinly-backend:latest
docker scan joinly-frontend:latest

# Actualizar imágenes base
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Verificar Headers de Seguridad

```bash
# Verificar headers HTTPS
curl -I https://tu-dominio.com

# Debe incluir:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
```

### Test de Penetración Básico

```bash
# Verificar puertos abiertos (desde otra máquina)
nmap -p- tu-dominio.com

# Solo deben estar abiertos: 22, 80, 443

# Test de SSL
ssllabs.com/ssltest/analyze.html?d=tu-dominio.com
```

## 📊 Monitoreo de Seguridad

### Logs a Monitorear

```bash
# Intentos de login SSH fallidos
sudo grep "Failed password" /var/log/auth.log | tail -20

# Conexiones sospechosas
sudo tail -f /var/log/nginx/access.log | grep -E "POST|PUT|DELETE"

# Errores de autenticación en la app
docker compose -f docker-compose.prod.yml logs backend | grep "Unauthorized"
```

### Alertas Automáticas

Configurar en `crontab`:

```bash
# Alerta si hay más de 10 intentos SSH fallidos en 1 hora
0 * * * * [ $(sudo grep "Failed password" /var/log/auth.log | grep "$(date '+%b %d %H')" | wc -l) -gt 10 ] && echo "Alerta: Intentos SSH sospechosos" | mail -s "Seguridad Joinly" tu@email.com
```

## 🔄 Actualizaciones de Seguridad

### Sistema Operativo

```bash
# Actualizaciones automáticas
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades

# Actualización manual
sudo apt update && sudo apt upgrade -y
```

### Docker y Dependencias

```bash
# Actualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Actualizar imágenes
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Aplicación

```bash
# Actualizar código
git pull origin main

# Reconstruir con últimas dependencias
./scripts/deploy.sh --build
```

## 🎯 Mejores Prácticas

1. **Principio de Mínimo Privilegio**: Solo los permisos necesarios
2. **Defensa en Profundidad**: Múltiples capas de seguridad
3. **Fail Secure**: En caso de error, denegar acceso
4. **Auditoría Continua**: Revisar logs regularmente
5. **Actualizaciones Frecuentes**: Parchear vulnerabilidades rápido
6. **Backups Regulares**: Poder recuperar en caso de compromiso
7. **Cifrado Siempre**: Datos en tránsito y en reposo
8. **Zero Trust**: Verificar todo, confiar en nada

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

**Última revisión:** Diciembre 2024  
**Siguiente revisión:** Mensual
