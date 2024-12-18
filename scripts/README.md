# =============================================================================
# Joinly - Scripts de Utilidad
# =============================================================================
# Este directorio contiene scripts para gestión del proyecto.
# =============================================================================

## 📜 Scripts Disponibles

### Producción

| Script | Descripción | Uso |
|--------|-------------|-----|
| `deploy.sh` | Despliegue completo a producción | `./scripts/deploy.sh --build` |
| `init-ssl.sh` | Configurar certificados SSL | `./scripts/init-ssl.sh` |
| `setup-server.sh` | Configuración inicial del servidor | `sudo ./scripts/setup-server.sh` |

### Base de Datos

| Script | Descripción | Uso |
|--------|-------------|-----|
| `backup.sh` | Crear backup de MySQL | `./scripts/backup.sh` |
| `restore.sh` | Restaurar desde backup | `./scripts/restore.sh backups/archivo.sql.gz` |

### Inicialización MySQL

| Archivo | Descripción |
|---------|-------------|
| `mysql-init/01-init.sql` | Configuración inicial de MySQL |

## 🚀 Uso Rápido

```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Deploy completo
./scripts/deploy.sh --build

# Crear backup
./scripts/backup.sh

# Ver ayuda
./scripts/deploy.sh --help
```

## 📋 Orden de Ejecución (Primera vez)

1. **En el servidor nuevo:**
   ```bash
   curl -sSL <url>/setup-server.sh | sudo bash
   ```

2. **Clonar y configurar:**
   ```bash
   git clone <repo> /opt/joinly
   cd /opt/joinly
   cp .env.prod.example .env.prod
   nano .env.prod  # Configurar variables
   ```

3. **Desplegar:**
   ```bash
   ./scripts/deploy.sh --build
   ```

4. **Configurar SSL:**
   ```bash
   ./scripts/init-ssl.sh
   ```

## 🔒 Seguridad

- Todos los scripts validan requisitos antes de ejecutarse
- Se crean backups automáticos antes de operaciones destructivas
- Variables sensibles nunca se muestran en logs
- Permisos verificados antes de operaciones críticas

## 🔧 Mantenimiento

### Backups Automáticos (Cron)

```bash
# Editar crontab
crontab -e

# Backup diario a las 3:00 AM
0 3 * * * /opt/joinly/scripts/backup.sh >> /var/log/joinly-backup.log 2>&1

# Limpiar logs cada semana
0 0 * * 0 find /opt/joinly/backups -name "*.gz" -mtime +30 -delete
```

## 📞 Soporte

Si un script falla:
1. Verificar que tiene permisos de ejecución: `chmod +x scripts/*.sh`
2. Revisar variables de entorno: `.env` o `.env.prod`
3. Consultar logs: `docker compose logs`
