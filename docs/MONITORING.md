# =============================================================================
# Joinly - Guía de Monitoreo y Observabilidad
# =============================================================================

## 📊 Métricas Disponibles

### Health Checks

Todos los servicios tienen health checks configurados:

```bash
# Backend
curl https://tu-dominio.com/api/actuator/health

# Nginx
curl https://tu-dominio.com/nginx-health

# Frontend (interno)
docker compose -f docker-compose.prod.yml exec frontend wget -qO- http://localhost:4200/health
```

### Docker Stats

```bash
# Ver uso de recursos en tiempo real
docker stats

# Ver solo servicios de Joinly
docker stats $(docker compose -f docker-compose.prod.yml ps -q)
```

## 📝 Logs

### Localización

| Servicio | Ubicación |
|----------|-----------|
| Backend | `/var/lib/docker/volumes/joinly-backend-logs/_data/` |
| Nginx | `/var/lib/docker/volumes/joinly-nginx-logs/_data/` |
| MySQL | `docker compose -f docker-compose.prod.yml logs mysql` |

### Comandos Útiles

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.prod.yml logs

# Logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Últimas 100 líneas del backend
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Logs con timestamp
docker compose -f docker-compose.prod.yml logs -t backend

# Filtrar por error
docker compose -f docker-compose.prod.yml logs backend | grep ERROR
```

## 🚨 Alertas y Monitoreo

### Configurar Monitoreo con Uptime Kuma

```bash
# Añadir al docker-compose.prod.yml
uptime-kuma:
  image: louislam/uptime-kuma:latest
  container_name: joinly-uptime-kuma
  restart: always
  ports:
    - "3001:3001"
  volumes:
    - uptime_kuma_data:/app/data
```

Monitorear:
- https://tu-dominio.com (código 200)
- https://tu-dominio.com/api/actuator/health (código 200, contiene "UP")

### Configurar Notificaciones (Telegram/Email)

1. Crear bot de Telegram con @BotFather
2. Obtener Chat ID
3. Configurar en Uptime Kuma

## 📈 Métricas del Sistema

### Uso de Disco

```bash
# Espacio general
df -h

# Espacio de Docker
docker system df

# Volúmenes
docker volume ls
docker volume inspect joinly-mysql-data
```

### Uso de Memoria

```bash
# Memoria del sistema
free -h

# Memoria por contenedor
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### CPU

```bash
# Top de procesos
htop

# CPU por contenedor
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}"
```

## 🔍 Troubleshooting

### Verificar Estado de Servicios

```bash
# Listar contenedores
docker compose -f docker-compose.prod.yml ps

# Inspeccionar servicio específico
docker compose -f docker-compose.prod.yml ps backend
docker inspect joinly-backend-prod
```

### Verificar Conectividad Interna

```bash
# Desde backend a MySQL
docker compose -f docker-compose.prod.yml exec backend ping mysql

# Desde nginx a backend
docker compose -f docker-compose.prod.yml exec nginx wget -qO- http://backend:8080/actuator/health
```

### Verificar Certificados SSL

```bash
# Información del certificado
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Verificar validez
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/
```

## 📊 Dashboard Personalizado

### Script de Monitoreo

Crear `scripts/monitor.sh`:

```bash
#!/bin/bash
echo "=========================================="
echo "JOINLY - Estado del Sistema"
echo "=========================================="
echo ""
echo "🐳 Contenedores:"
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
echo ""
echo "💾 Uso de Recursos:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker compose -f docker-compose.prod.yml ps -q)
echo ""
echo "💿 Espacio en Disco:"
df -h / | tail -1
echo ""
echo "🔥 Certificados SSL:"
docker compose -f docker-compose.prod.yml exec -T nginx ls -l /etc/letsencrypt/live/ 2>/dev/null | grep -v total || echo "No disponible"
```

### Ejecutar

```bash
chmod +x scripts/monitor.sh
./scripts/monitor.sh
```

## 🔔 Configurar Alertas por Email

### Con Fail2ban (SSH)

Ya configurado en `setup-server.sh`. Para recibir emails:

```bash
# Instalar mailutils
sudo apt install mailutils -y

# Configurar en /etc/fail2ban/jail.local
destemail = tu@email.com
sendername = Fail2Ban-Joinly
action = %(action_mwl)s
```

### Monitoreo de Espacio en Disco

Crear cron job:

```bash
# Editar crontab
crontab -e

# Añadir alerta si disco > 80%
0 */6 * * * [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 80 ] && echo "Disco en $(hostname) sobre 80%" | mail -s "Alerta Disco" tu@email.com
```

## 📦 Rotación de Logs

Ya configurado en `setup-server.sh`. Verificar:

```bash
cat /etc/logrotate.d/docker-containers
```

## 🎯 Objetivos de Rendimiento

| Métrica | Objetivo | Verificación |
|---------|----------|--------------|
| Tiempo de respuesta API | < 200ms | `curl -w "@curl-format.txt" https://tu-dominio.com/api/health` |
| Uptime | > 99.5% | Uptime Kuma |
| Uso de RAM | < 70% | `free -h` |
| Uso de Disco | < 80% | `df -h` |
| CPU | < 60% | `htop` |

## 🛠️ Herramientas Recomendadas

- **Uptime Kuma**: Monitoreo de disponibilidad
- **Portainer**: Gestión visual de Docker
- **Grafana + Prometheus**: Métricas avanzadas (opcional)
- **Netdata**: Monitoreo del sistema en tiempo real

---

*Para configuración avanzada de monitoreo, consulta la documentación oficial de cada herramienta.*
