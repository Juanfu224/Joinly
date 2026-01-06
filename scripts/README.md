# Scripts de Despliegue - Joinly

Scripts automatizados para gestión de producción.

## Uso Rápido

```bash
# Primer despliegue
./scripts/deploy.sh --build

# Configurar SSL (Let's Encrypt)
./scripts/init-ssl.sh

# Backup
./scripts/backup.sh

# Restaurar
./scripts/restore.sh backups/joinly_YYYYMMDD.sql.gz
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `deploy.sh` | Despliegue a producción |
| `init-ssl.sh` | Configurar SSL Let's Encrypt |
| `backup.sh` | Backup de base de datos |
| `restore.sh` | Restaurar backup |
| `setup-server.sh` | Configuración inicial del servidor |

## Requisitos

- Docker y Docker Compose
- Archivo `.env.prod` configurado
- Para SSL: dominio apuntando al servidor

## Opciones

```bash
# Deploy
./scripts/deploy.sh [--build] [--restart] [--logs]

# Backup
./scripts/backup.sh [--keep N]

# SSL
./scripts/init-ssl.sh [--auto]
```
