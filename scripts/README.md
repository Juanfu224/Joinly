# Scripts de Despliegue - Joinly

Scripts automatizados para gestión de producción. Diseñados para ser simples, robustos y funcionar a la primera.

## 🚀 Uso Rápido

```bash
# Primer despliegue en servidor nuevo
sudo ./scripts/setup-server.sh      # Configurar servidor (solo primera vez)
./scripts/deploy.sh --build         # Desplegar aplicación

# Configurar SSL con Let's Encrypt
./scripts/init-ssl.sh

# Verificar estado
./scripts/health-check.sh

# Backup
./scripts/backup.sh
```

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `quick-deploy.sh` | Despliegue remoto automatizado (rsync + deploy + SSL + health check) |
| `deploy.sh` | Despliegue completo a producción (Git pull + Docker build + health check) |
| `init-ssl.sh` | Obtener certificado SSL de Let's Encrypt |
| `health-check.sh` | Verificar estado de todos los servicios |
| `backup.sh` | Backup de base de datos con rotación |
| `restore.sh` | Restaurar backup con verificación |
| `setup-server.sh` | Configuración inicial del servidor (Docker, firewall, etc.) |
| `build-prod.sh` | Build de frontend y backend para producción |
| `analyze-bundles.sh` | Análisis de bundles del frontend |

## ⚙️ Opciones de Cada Script

### quick-deploy.sh
```bash
./scripts/quick-deploy.sh [user@]hostname [directory]

# Ejemplos:
./scripts/quick-deploy.sh root@joinly.studio /opt/joinly
./scripts/quick-deploy.sh joinly@192.168.1.100

# Omitir configuración inicial del servidor:
SKIP_SETUP=true ./scripts/quick-deploy.sh root@joinly.studio
```

Este script automatiza todo el despliegue remoto:
1. Copia el código vía rsync
2. Ejecuta setup-server.sh (si es necesario)
3. Configura .env.prod
4. Ejecuta deploy.sh --build
5. Configura SSL con Let's Encrypt
6. Verifica el despliegue

### deploy.sh
```bash
./scripts/deploy.sh [opciones]

  --build     Reconstruir imágenes Docker (automático si hay cambios en Git)
  --restart   Solo reiniciar servicios sin recrear
  --logs      Mostrar logs después del deploy
  --no-pull   No actualizar código desde Git
  --help      Mostrar ayuda
```

### init-ssl.sh
```bash
./scripts/init-ssl.sh [opciones]

  --auto      No pedir confirmación
  --renew     Forzar renovación del certificado
  --help      Mostrar ayuda
```

### health-check.sh
```bash
./scripts/health-check.sh [opciones]

  --json      Salida en formato JSON (para monitoreo)
  --quiet     Solo código de salida (0=OK, 1=ERROR)
  --help      Mostrar ayuda
```

### backup.sh
```bash
./scripts/backup.sh [opciones]

  --keep N    Mantener N backups (default: 7)
  --upload    Subir a S3 (requiere AWS CLI configurado)
  --quiet     Sin salida (ideal para cron)
  --help      Mostrar ayuda
```

### restore.sh
```bash
./scripts/restore.sh <archivo.sql.gz> [opciones]

  --force     No pedir confirmación
  --help      Mostrar ayuda
```

## 📦 Requisitos

- **Docker** y **Docker Compose** v2+
- Archivo **`.env.prod`** configurado (copiar de `.env.prod.example`)
- Para SSL: dominio apuntando al servidor (DNS configurado)

## 🔧 Configuración Automática con Cron

### Backup diario a las 3am
```bash
0 3 * * * /opt/joinly/scripts/backup.sh --keep 7 --quiet >> /var/log/joinly-backup.log 2>&1
```

### Health check cada 5 minutos
```bash
*/5 * * * * /opt/joinly/scripts/health-check.sh --quiet || echo "Joinly down" | mail -s "Alert" admin@example.com
```

## 🔒 Flujo de Despliegue Completo

### Opción A: Despliegue Remoto Automatizado (Recomendado)
```bash
# Desde tu máquina local
./scripts/quick-deploy.sh root@joinly.studio /opt/joinly
```

### Opción B: Despliegue Manual en el Servidor
```
1. setup-server.sh    → Prepara el servidor (una sola vez)
2. git clone          → Clonar repositorio
3. cp .env.prod.example .env.prod → Crear configuración
4. nano .env.prod     → Editar variables (DOMAIN, JWT_SECRET, etc.)
5. deploy.sh --build  → Primer despliegue
6. init-ssl.sh        → Obtener certificado SSL
7. health-check.sh    → Verificar que todo funciona
```

## 🔄 Actualizaciones

### Opción A: Actualización desde Local (Recomendado)
```bash
# Desde tu máquina local
./scripts/quick-deploy.sh root@joinly.studio /opt/joinly
```

### Opción B: Actualización en el Servidor
```bash
cd /opt/joinly
./scripts/deploy.sh --build  # Automáticamente hace git pull y rebuild
```

## 🐛 Solución de Problemas

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart nginx

# Estado detallado
./scripts/health-check.sh --json
```

