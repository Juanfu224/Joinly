# ✅ Checklist de Despliegue - Joinly

Usa esta lista para asegurar que todos los pasos del despliegue se completan correctamente.

---

## 📋 Pre-Despliegue

### Acceso al Servidor
- [ ] Servidor VPS aprovisionado (IP: 159.89.1.100)
- [ ] SSH habilitado y accesible
- [ ] Puertos 22, 80, 443 abiertos en firewall del proveedor
- [ ] Credenciales de root disponibles

### Repositorio
- [ ] Código pusheado a GitHub
- [ ] Rama `main` actualizada
- [ ] Sin archivos sensibles en el repo (.env, credenciales)

### Documentación
- [ ] README.md actualizado
- [ ] Variables de entorno documentadas
- [ ] Scripts de despliegue ejecutables

---

## 🔧 Configuración del Servidor

### Instalación Básica
- [ ] Sistema operativo actualizado (`apt update && apt upgrade`)
- [ ] Docker instalado y corriendo
- [ ] Docker Compose instalado
- [ ] Git instalado
- [ ] Firewall configurado (UFW)
- [ ] Fail2ban configurado

### Usuario y Permisos
- [ ] Usuario `joinly` creado
- [ ] Usuario agregado al grupo `docker`
- [ ] Directorio `/opt/joinly` creado
- [ ] Permisos correctos en `/opt/joinly`

### Firewall
- [ ] SSH permitido (puerto 22)
- [ ] HTTP permitido (puerto 80)
- [ ] HTTPS permitido (puerto 443)
- [ ] Firewall activado y funcionando

---

## 📦 Despliegue de la Aplicación

### Repositorio
- [ ] Repositorio clonado en `/opt/joinly`
- [ ] Rama correcta (`main`) checkout
- [ ] `.git` presente y funcional

### Variables de Entorno
- [ ] Archivo `.env.prod` creado
- [ ] `MYSQL_ROOT_PASSWORD` generado y configurado
- [ ] `MYSQL_PASSWORD` generado y configurado
- [ ] `JWT_SECRET_KEY` generado (64 bytes)
- [ ] `ENCRYPTION_KEY` generado (32 bytes)
- [ ] `DOMAIN` configurado (IP o dominio)
- [ ] `LETSENCRYPT_EMAIL` configurado (si HTTPS)
- [ ] Permisos 600 en `.env.prod`
- [ ] Backup de credenciales guardado en lugar seguro

### Scripts
- [ ] Scripts tienen permisos de ejecución (`chmod +x scripts/*.sh`)
- [ ] `setup-server.sh` ejecutado (si manual)
- [ ] `deploy.sh` ejecutado con `--build`

### Contenedores Docker
- [ ] Imagen `joinly-mysql-prod` construida
- [ ] Imagen `joinly-backend-prod` construida
- [ ] Imagen `joinly-nginx-prod` construida
- [ ] Contenedor MySQL corriendo y healthy
- [ ] Contenedor Backend corriendo y healthy
- [ ] Contenedor Nginx corriendo y healthy

---

## 🔍 Verificación Post-Despliegue

### Estado de Servicios
- [ ] Todos los contenedores en estado "Up"
- [ ] Health checks pasando (verde)
- [ ] No hay errores en logs iniciales

### Base de Datos
- [ ] MySQL acepta conexiones
- [ ] Base de datos `bbdd_joinly` creada
- [ ] Usuario `joinly_user` existe y tiene permisos
- [ ] Migraciones Flyway aplicadas correctamente

### Backend
- [ ] Backend responde en puerto 8080 (interno)
- [ ] Actuator health: `200 OK`
- [ ] Swagger UI accesible
- [ ] JWT funcionando
- [ ] Conexión a BD establecida

### Frontend
- [ ] Nginx responde en puerto 80/443
- [ ] SPA carga correctamente
- [ ] Assets estáticos servidos
- [ ] Proxy inverso a API funciona

### Acceso Externo
- [ ] Frontend accesible: `http://159.89.1.100`
- [ ] API accesible: `http://159.89.1.100/api`
- [ ] Swagger accesible: `http://159.89.1.100/swagger-ui/`
- [ ] Health endpoint: `http://159.89.1.100/actuator/health`

---

## 🔒 Seguridad

### Credenciales
- [ ] Contraseñas generadas con `openssl rand`
- [ ] Contraseñas únicas (no por defecto)
- [ ] JWT_SECRET único y seguro (64 bytes)
- [ ] ENCRYPTION_KEY único y seguro (32 bytes)
- [ ] Credenciales guardadas en gestor de contraseñas

### Configuración
- [ ] Usuario no-root en contenedores
- [ ] Firewall activo y configurado
- [ ] Fail2ban activo
- [ ] SSH con autenticación por clave (no contraseña)
- [ ] Archivo `.env.prod` NO en Git
- [ ] Permisos correctos en archivos sensibles (600)

### Red
- [ ] Contenedores en redes aisladas
- [ ] Solo Nginx expuesto externamente
- [ ] Backend no accesible desde fuera
- [ ] MySQL solo accesible internamente

---

## 🌐 HTTPS (Opcional)

### DNS
- [ ] Dominio registrado
- [ ] Registro A apuntando a 159.89.1.100
- [ ] Registro A www apuntando a 159.89.1.100
- [ ] DNS propagado (verificar con `dig`)

### Certificado SSL
- [ ] `DOMAIN` configurado en `.env.prod`
- [ ] `LETSENCRYPT_EMAIL` configurado
- [ ] Script `init-ssl.sh` ejecutado
- [ ] Certificado obtenido exitosamente
- [ ] Nginx recargado con configuración SSL
- [ ] HTTPS funcionando
- [ ] Redirección HTTP → HTTPS activa
- [ ] Renovación automática configurada (Certbot)

---

## 📊 Monitoreo

### Logs
- [ ] Logs del backend accesibles
- [ ] Logs de nginx accesibles
- [ ] Logs de MySQL accesibles
- [ ] Logrotate configurado

### Recursos
- [ ] Uso de CPU monitoreado
- [ ] Uso de RAM monitoreado
- [ ] Uso de disco monitoreado
- [ ] Límites de recursos configurados en Docker

### Backups
- [ ] Script `backup.sh` funciona
- [ ] Directorio `/opt/joinly/backups` existe
- [ ] Primer backup manual creado
- [ ] Plan de backups automáticos definido

---

## 🧪 Testing Post-Despliegue

### Funcionalidad Básica
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] JWT tokens se generan
- [ ] Refresh token funciona
- [ ] API endpoints responden
- [ ] Frontend carga correctamente

### Integración
- [ ] Frontend se comunica con Backend
- [ ] Backend se comunica con MySQL
- [ ] Credenciales encriptadas funcionan
- [ ] CORS configurado correctamente

### Rendimiento
- [ ] Tiempo de respuesta < 500ms (API)
- [ ] Frontend carga < 3s
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs de servidor

---

## 📝 Documentación

### Actualizada
- [ ] README.md con URLs de producción
- [ ] Credenciales documentadas (en lugar seguro)
- [ ] Proceso de despliegue documentado
- [ ] Comandos de gestión documentados

### Accesible
- [ ] Equipo tiene acceso a documentación
- [ ] Credenciales compartidas de forma segura
- [ ] Contactos de soporte anotados

---

## 🚀 Go Live

### Pre-Launch
- [ ] Todos los items anteriores completados
- [ ] Testing exhaustivo realizado
- [ ] Plan de rollback definido
- [ ] Equipo notificado

### Launch
- [ ] DNS apuntando correctamente (si dominio)
- [ ] Certificado SSL activo (si HTTPS)
- [ ] Aplicación accesible públicamente
- [ ] Usuarios pueden registrarse y usar

### Post-Launch
- [ ] Monitoreo activo primeras 24h
- [ ] Logs revisados periódicamente
- [ ] Backups verificados
- [ ] Documentación de incidentes actualizada

---

## 📞 Contactos de Emergencia

### Proveedor VPS
- **Proveedor:** _________________________
- **Panel:** _____________________________
- **Soporte:** ___________________________

### Dominio/DNS
- **Proveedor:** _________________________
- **Panel:** _____________________________

### Equipo
- **Desarrollador:** Juan (@Juanfu224)
- **GitHub:** https://github.com/Juanfu224/Joinly

---

## 🆘 Comandos de Emergencia

```bash
# Ver estado rápido
docker compose -f docker-compose.prod.yml ps

# Ver todos los logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart

# Parar servicios (EMERGENCIA)
docker compose -f docker-compose.prod.yml down

# Restaurar desde backup
./scripts/restore.sh /path/to/backup.sql.gz

# Ver uso de recursos
docker stats
htop

# Verificar conectividad
curl http://localhost/actuator/health
```

---

## ✅ Firma de Aprobación

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Desarrollador | | | |
| DevOps | | | |
| QA | | | |

---

**Versión:** 1.0  
**Última actualización:** 20 de diciembre de 2025  
**Mantenedor:** Juan (@Juanfu224)
