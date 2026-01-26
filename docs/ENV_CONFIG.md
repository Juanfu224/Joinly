# Guía de Variables de Entorno - Joinly

Este documento documenta todas las variables de entorno configurables en Joinly, sus valores por defecto y cómo generar valores seguros.

## Tabla de Contenidos

- [Variables de Backend](#variables-de-backend)
- [Variables de Frontend](#variables-de-frontend)
- [Variables de Docker](#variables-de-docker)
- [Variables de Producción](#variables-de-producción)
- [Generación de Claves Seguras](#generación-de-claves-seguras)

---

## Variables de Backend

### Base de Datos

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `DB_HOST` | Sí | Host de MySQL | `mysql` | `localhost` |
| `DB_PORT` | No | Puerto de MySQL | `3306` | `3306` |
| `DB_NAME` | Sí | Nombre de base de datos | `joinly` | `joinly_prod` |
| `DB_USERNAME` | Sí | Usuario de MySQL | `root` | `joinly_user` |
| `DB_PASSWORD` | Sí | Contraseña de MySQL | `root_password` | `SecurePassword123!` |

### Spring Boot

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | No | Profile de Spring | `dev` | `prod` |
| `SERVER_PORT` | No | Puerto del servidor | `8080` | `8080` |
| `SPRING_DATASOURCE_URL` | No | URL JDBC completa | - | `jdbc:mysql://localhost:3306/joinly` |

### JWT (JSON Web Token)

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `JWT_SECRET_KEY` | Sí | Clave secreta para JWT | - | Generada con `openssl` |
| `JWT_ACCESS_TOKEN_EXPIRATION` | No | Expiración access token (ms) | `900000` (15 min) | `900000` |
| `JWT_REFRESH_TOKEN_EXPIRATION` | No | Expiración refresh token (ms) | `604800000` (7 días) | `604800000` |

### Encriptación

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `ENCRYPTION_KEY` | Sí | Clave para AES-256 | - | Generada con `openssl` |

### CORS (Cross-Origin Resource Sharing)

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `CORS_ALLOWED_ORIGIN` | No | Origins permitidos | `http://localhost:4200` | `https://joinly.studio` |
| `CORS_ALLOWED_METHODS` | No | Métodos HTTP permitidos | `GET,POST,PUT,DELETE,OPTIONS` | `GET,POST,PUT,DELETE,OPTIONS` |
| `CORS_ALLOWED_HEADERS` | No | Headers permitidos | `*` | `*` |

### Archivos

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `FILE_UPLOAD_DIR` | No | Directorio de uploads | `./uploads` | `/var/joinly/uploads` |
| `FILE_MAX_SIZE` | No | Tamaño máximo archivo (bytes) | `10485760` (10MB) | `10485760` |

---

## Variables de Frontend

### API Configuration

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `API_BASE_URL` | Sí | Base URL de la API | `http://localhost:8080/api/v1` | `https://joinly.studio/api/v1` |
| `API_TIMEOUT` | No | Timeout de requests (ms) | `30000` (30s) | `30000` |

### Application Configuration

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `APP_NAME` | No | Nombre de la aplicación | `Joinly` | `Joinly` |
| `APP_TITLE` | No | Título de la página | `Joinly` | `Joinly` |
| `APP_DESCRIPTION` | No | Meta descripción | `Plataforma de suscripciones compartidas` | `Plataforma de suscripciones compartidas` |

### Feature Flags

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `FEATURE_REGISTRATION` | No | Habilitar registro | `true` | `true` |
| `FEATURE_SOCIAL_LOGIN` | No | Habilitar login social | `false` | `false` |
| `FEATURE_DARK_MODE` | No | Habilitar modo oscuro | `true` | `true` |
| `FEATURE_NOTIFICATIONS` | No | Habilitar notificaciones | `true` | `true` |

---

## Variables de Docker

### Docker Compose

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | Sí | Contraseña root de MySQL | - | `SecureRootPassword123!` |
| `MYSQL_DATABASE` | Sí | Nombre de base de datos | `joinly` | `joinly_prod` |
| `MYSQL_USER` | No | Usuario de MySQL | `joinly` | `joinly_user` |
| `MYSQL_PASSWORD` | Sí | Contraseña de MySQL | - | `SecurePassword123!` |

### Networking

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `FRONTEND_PORT` | No | Puerto del frontend | `80` | `80` |
| `BACKEND_PORT` | No | Puerto del backend | `8080` | `8080` |
| `MYSQL_PORT` | No | Puerto de MySQL | `3306` | `3306` |

### Volumes

| Variable | Obligatoria | Descripción | Por Defecto | Ejemplo |
|----------|--------------|-------------|-------------|---------|
| `MYSQL_DATA_DIR` | No | Directorio de datos de MySQL | `mysql-data` | `/var/lib/mysql` |
| `UPLOADS_DIR` | No | Directorio de uploads | `./uploads` | `/var/joinly/uploads` |

---

## Variables de Producción

### Base de Datos

```env
# ==================================================
# BASE DE DATOS - PRODUCCIÓN
# ==================================================
DB_HOST=joinly-mysql-prod
DB_PORT=3306
DB_NAME=joinly_prod
DB_USERNAME=joinly_user
DB_PASSWORD=tu_password_seguro_aqui_generado_con_openssl
```

### Spring Boot

```env
# ==================================================
# SPRING BOOT - PRODUCCIÓN
# ==================================================
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# ==================================================
# BASE DE DATOS CONNECTION POOL
# ==================================================
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5
SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT=600000
SPRING_DATASOURCE_HIKARI_MAX_LIFETIME=1800000
```

### JWT

```env
# ==================================================
# JWT - PRODUCCIÓN
# ==================================================
# Generar con: openssl rand -base64 64
JWT_SECRET_KEY=tu_clave_jwt_secreta_de_64_bytes_aqui_generado_con_openssl

# Access token: 15 minutos (900000 ms)
JWT_ACCESS_TOKEN_EXPIRATION=900000

# Refresh token: 7 días (604800000 ms)
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# ==================================================
# JWT CLAIMS
# ==================================================
JWT_ISSUER=joinly.studio
JWT_AUDIENCE=joinly-app
```

### Encriptación

```env
# ==================================================
# ENCRIPTACIÓN - PRODUCCIÓN
# ==================================================
# Generar con: openssl rand -base64 32
ENCRYPTION_KEY=tu_clave_aes_256_de_32_bytes_aqui_generado_con_openssl
```

### CORS

```env
# ==================================================
# CORS - PRODUCCIÓN
# ==================================================
CORS_ALLOWED_ORIGIN=https://joinly.studio
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type,Accept,X-Requested-With
CORS_MAX_AGE=3600
```

### Archivos

```env
# ==================================================
# ARCHIVOS - PRODUCCIÓN
# ==================================================
FILE_UPLOAD_DIR=/var/joinly/uploads
FILE_MAX_SIZE=10485760
FILE_ALLOWED_TYPES=image/png,image/jpeg,application/pdf
```

### Logging

```env
# ==================================================
# LOGGING - PRODUCCIÓN
# ==================================================
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_ALBERTI_JOINLY=INFO
LOGGING_FILE_NAME=/var/log/joinly/application.log
LOGGING_FILE_MAX_SIZE=10MB
LOGGING_FILE_MAX_HISTORY=30
```

### Actuator

```env
# ==================================================
# ACTUATOR - PRODUCCIÓN
# ==================================================
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=never
MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true
```

---

## Generación de Claves Seguras

### JWT Secret Key (64 bytes)

```bash
# Generar clave JWT SECRET KEY
openssl rand -base64 64

# Ejemplo de salida (NO USAR ESTE VALOR):
# aB3dE7fI2jK9mN4pQ6rT8vW2xY5zB8cD1eG3hI6kL9nO2pR5sU8wZ0bC4dF7gI0jK3
```

### Encriptación Key (32 bytes)

```bash
# Generar clave de encriptación AES-256
openssl rand -base64 32

# Ejemplo de salida (NO USAR ESTE VALOR):
# xY9zA2bC5dE8fG1hI4jK7lM0nO3pQ6rS9tV2wY5zB8=
```

### Contraseñas Seguras

```bash
# Generar contraseña segura (32 caracteres)
openssl rand -base64 32 | head -c 32

# Ejemplo de salida (NO USAR ESTE VALOR):
# kL9mN2pQ5rS8tV1wY4zB7cD0fG3hI6j
```

---

## Ejemplo de Archivo .env Completo

### Desarrollo (.env)

```env
# ==================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==================================================
DB_HOST=mysql
DB_PORT=3306
DB_NAME=joinly
DB_USERNAME=root
DB_PASSWORD=root_password

# ==================================================
# CONFIGURACIÓN DE SPRING BOOT
# ==================================================
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# ==================================================
# CONFIGURACIÓN JWT
# ==================================================
# Generar con: openssl rand -base64 64
JWT_SECRET_KEY=tu_clave_jwt_secreta_de_64_bytes_aqui

# Access token: 15 minutos (900000 ms)
JWT_ACCESS_TOKEN_EXPIRATION=900000

# Refresh token: 7 días (604800000 ms)
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# ==================================================
# CONFIGURACIÓN DE ENCRIPTACIÓN
# ==================================================
# Generar con: openssl rand -base64 32
ENCRYPTION_KEY=tu_clave_encriptacion_de_32_bytes_aqui

# ==================================================
# CONFIGURACIÓN CORS
# ==================================================
CORS_ALLOWED_ORIGIN=http://localhost:4200
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*

# ==================================================
# CONFIGURACIÓN DE ARCHIVOS
# ==================================================
FILE_UPLOAD_DIR=./uploads
FILE_MAX_SIZE=10485760
```

### Producción (.env.prod)

```env
# ==================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==================================================
DB_HOST=joinly-mysql-prod
DB_PORT=3306
DB_NAME=joinly_prod
DB_USERNAME=joinly_user
DB_PASSWORD=tu_password_seguro_aqui_generado_con_openssl

# ==================================================
# CONFIGURACIÓN DE SPRING BOOT
# ==================================================
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# ==================================================
# CONFIGURACIÓN JWT
# ==================================================
# Generar con: openssl rand -base64 64
JWT_SECRET_KEY=tu_clave_jwt_secreta_de_64_bytes_aqui_generado_con_openssl

# Access token: 15 minutos (900000 ms)
JWT_ACCESS_TOKEN_EXPIRATION=900000

# Refresh token: 7 días (604800000 ms)
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# ==================================================
# CONFIGURACIÓN DE ENCRIPTACIÓN
# ==================================================
# Generar con: openssl rand -base64 32
ENCRYPTION_KEY=tu_clave_aes_256_de_32_bytes_aqui_generado_con_openssl

# ==================================================
# CONFIGURACIÓN CORS
# ==================================================
CORS_ALLOWED_ORIGIN=https://joinly.studio
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type,Accept,X-Requested-With
CORS_MAX_AGE=3600

# ==================================================
# CONFIGURACIÓN DE ARCHIVOS
# ==================================================
FILE_UPLOAD_DIR=/var/joinly/uploads
FILE_MAX_SIZE=10485760
FILE_ALLOWED_TYPES=image/png,image/jpeg,application/pdf

# ==================================================
# CONFIGURACIÓN DE LOGGING
# ==================================================
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_ALBERTI_JOINLY=INFO
LOGGING_FILE_NAME=/var/log/joinly/application.log
LOGGING_FILE_MAX_SIZE=10MB
LOGGING_FILE_MAX_HISTORY=30

# ==================================================
# CONFIGURACIÓN DE ACTUATOR
# ==================================================
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=never
MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true
```

---

## Seguridad de Variables de Entorno

### Buenas Prácticas

1. **Nunca hacer commit de .env con claves reales**
   - Usar `.env.example` con valores de ejemplo
   - Agregar `.env` a `.gitignore`

2. **Usar valores únicos por entorno**
   - Dev: Valores de ejemplo
   - Staging: Valores de prueba
   - Production: Valores únicos y seguros

3. **Rotar claves periódicamente**
   - JWT_SECRET_KEY: Cada 6 meses
   - ENCRYPTION_KEY: Cada 12 meses
   - DB_PASSWORD: Cada 90 días

4. **Usar secret management tools en producción**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Secret Manager

5. **Validar configuración al iniciar**
   ```java
   @PostConstruct
   public void validateConfiguration() {
       if (encryptionKey == null || encryptionKey.length() != 32) {
           throw new IllegalStateException("ENCRYPTION_KEY no es válido");
       }
       if (jwtSecretKey == null || jwtSecretKey.length() < 64) {
           throw new IllegalStateException("JWT_SECRET_KEY no es válido");
       }
   }
   ```

### .gitignore

Asegúrate de que `.gitignore` contenga:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
logs/

# Uploads
uploads/

# IDE
.idea/
.vscode/
*.iml
```

---

## Troubleshooting

### JWT_SECRET_KEY no es válida

**Error**: `JWT_SECRET_KEY no es válida`

**Solución**:
1. Generar nueva clave: `openssl rand -base64 64`
2. Verificar que la clave tiene al menos 64 caracteres
3. Reiniciar el backend

### ENCRYPTION_KEY no es válida

**Error**: `ENCRYPTION_KEY no es válida`

**Solución**:
1. Generar nueva clave: `openssl rand -base64 32`
2. Verificar que la clave tiene exactamente 32 bytes (después de base64)
3. Reiniciar el backend

### MySQL no conecta

**Error**: `Communications link failure`

**Solución**:
1. Verificar que `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` son correctos
2. Verificar que MySQL está corriendo: `docker ps | grep mysql`
3. Verificar que el puerto es accesible: `telnet localhost 3306`

### CORS bloquea requests

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solución**:
1. Verificar que `CORS_ALLOWED_ORIGIN` incluye tu dominio
2. Verificar que el método HTTP está en `CORS_ALLOWED_METHODS`
3. Verificar que el header está en `CORS_ALLOWED_HEADERS`

---

## Referencias

- [Spring Boot - Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Angular - Environment Variables](https://angular.dev/guide/configuration/understand-angular-configuration)
- [Docker - Environment Variables](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
- [JWT.io - Introduction](https://jwt.io/introduction)
- [NIST - Recommendation for Password Generation](https://csrc.nist.gov/publications/detail/sp/800-63b/final)

---

**Última actualización**: 26 de enero de 2026
**Versión**: 1.0.0
