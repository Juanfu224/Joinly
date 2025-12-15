# Guía de Seguridad - Joinly Backend

## Variables de Entorno y Secretos

### Archivos del Sistema

1. **`.env`** (NO en Git)
   - Contiene credenciales reales
   - Único para cada desarrollador/entorno
   - Protegido por `.gitignore`

2. **`.env.example`** (SÍ en Git)
   - Plantilla con valores de ejemplo
   - Documentación de variables requeridas
   - Sin información sensible

3. **`application.properties`**
   - Referencias a variables de entorno
   - Sin credenciales hardcodeadas
   - Valores por defecto seguros

## Variables Requeridas

### Base de Datos
```bash
DB_URL=jdbc:mysql://localhost:3306/bbdd_joinly
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_mysql
```

### JWT (Autenticación)
```bash
# Generar con: openssl rand -base64 64
JWT_SECRET_KEY=clave_aleatoria_64_bytes_base64

# Opcional: 1 hora = 3600000ms
JWT_ACCESS_TOKEN_EXPIRATION=3600000

# Opcional: 30 días = 2592000000ms
JWT_REFRESH_TOKEN_EXPIRATION=2592000000
```

### Encriptación AES-256
```bash
# Generar con: openssl rand -base64 32
ENCRYPTION_KEY=clave_aleatoria_32_bytes_base64
```

## Generación de Claves Seguras

### Usando OpenSSL (Linux/Mac/Windows Git Bash)

```bash
# Clave JWT (512 bits = 64 bytes)
openssl rand -base64 64

# Clave AES-256 (256 bits = 32 bytes)
openssl rand -base64 32
```

### Usando /dev/urandom (Linux/Mac)

```bash
# JWT
head -c 64 /dev/urandom | base64

# AES
head -c 32 /dev/urandom | base64
```

### Usando PowerShell (Windows)

```powershell
# JWT
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# AES
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Usando Python

```python
import os
import base64

# JWT (64 bytes)
jwt_key = base64.b64encode(os.urandom(64)).decode('utf-8')
print(f"JWT_SECRET_KEY={jwt_key}")

# AES (32 bytes)
aes_key = base64.b64encode(os.urandom(32)).decode('utf-8')
print(f"ENCRYPTION_KEY={aes_key}")
```

## Configuración por Entorno

### Desarrollo Local

1. Copiar plantilla:
```bash
cp .env.example .env
```

2. Generar claves únicas:
```bash
echo "JWT_SECRET_KEY=$(openssl rand -base64 64)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env
```

3. Añadir contraseña de MySQL:
```bash
echo "DB_PASSWORD=tu_contraseña" >> .env
```

### Testing

Los tests usan H2 en memoria y no requieren configuración adicional. Las variables de entorno se configuran en `src/test/resources/application.properties`.

### Staging/Producción

**NUNCA usar archivos `.env` en producción.** Configurar variables de entorno del sistema:

#### Linux/Mac (systemd, supervisord)

```bash
# /etc/environment o archivo de servicio
export DB_PASSWORD="contraseña_producción"
export JWT_SECRET_KEY="clave_jwt_producción"
export ENCRYPTION_KEY="clave_aes_producción"
```

#### Docker/Docker Compose

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - DB_URL=jdbc:mysql://mysql:3306/joinly_prod
      - DB_USERNAME=joinly_user
      - DB_PASSWORD=${DB_PASSWORD}  # Desde host
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
```

#### Kubernetes

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: joinly-secrets
type: Opaque
data:
  db-password: <base64_encoded_password>
  jwt-secret: <base64_encoded_jwt_key>
  encryption-key: <base64_encoded_aes_key>
```

#### Servicios Cloud

- **AWS**: Secrets Manager o Systems Manager Parameter Store
- **Azure**: Key Vault
- **Google Cloud**: Secret Manager
- **Heroku**: Config Vars en Dashboard
- **Railway/Render**: Environment Variables en Panel

## Checklist de Seguridad

### Antes de Desarrollo

- [ ] Archivo `.env` creado y configurado
- [ ] Claves generadas aleatoriamente (no usar las del ejemplo)
- [ ] `.env` en `.gitignore`
- [ ] Permisos del archivo `.env` restringidos: `chmod 600 .env`

### Antes de Commit

- [ ] No hay credenciales en el código fuente
- [ ] No hay credenciales en `application.properties`
- [ ] `.env` NO está en el commit
- [ ] `.env.example` tiene valores de ejemplo (no reales)

### Antes de Producción

- [ ] Todas las claves regeneradas (diferentes a desarrollo)
- [ ] Variables configuradas en el sistema (no en archivo)
- [ ] Claves almacenadas en servicio de secrets
- [ ] Acceso a secrets restringido por roles
- [ ] Logs no muestran valores de secrets
- [ ] Backup seguro de las claves

### Rotación de Claves

- [ ] Rotación cada 3-6 meses
- [ ] Registro de cuándo se rotaron
- [ ] Proceso documentado para rotación sin downtime
- [ ] Tokens antiguos invalidados gradualmente

## Troubleshooting

### Error: "Could not resolve placeholder"

**Causa:** Variable de entorno no definida.

**Solución:**
1. Verificar que `.env` existe
2. Verificar que todas las variables están definidas
3. Reiniciar la aplicación

### Error: "Access denied for user"

**Causa:** Credenciales de MySQL incorrectas.

**Solución:**
1. Verificar `DB_PASSWORD` en `.env`
2. Probar login manual: `mysql -u root -p`
3. Verificar permisos del usuario en MySQL

### Error: "Invalid JWT signature"

**Causa:** `JWT_SECRET_KEY` cambió.

**Solución:**
- Los tokens anteriores son inválidos
- Los usuarios deben volver a hacer login
- En producción, planificar rotación con gracia period

### Error: "Invalid AES key length"

**Causa:** `ENCRYPTION_KEY` no tiene 32 bytes en base64.

**Solución:**
```bash
# Regenerar con longitud correcta
openssl rand -base64 32
```

## Buenas Prácticas

1. **Principio de Mínimo Privilegio**
   - Usuario de BD con permisos mínimos necesarios
   - No usar usuario `root` en producción

2. **Separación de Entornos**
   - Claves diferentes por entorno
   - Base de datos separada por entorno

3. **Rotación de Claves**
   - JWT: cada 3-6 meses
   - Encriptación: cada 6-12 meses
   - Contraseñas: según política de seguridad

4. **Monitoreo**
   - Logs de accesos fallidos
   - Alertas de múltiples intentos de login
   - Auditoría de uso de claves

5. **Backups**
   - Claves guardadas en vault seguro
   - Proceso de recuperación documentado
   - Backups encriptados

6. **Never Do**
   - Hardcodear contraseñas en código
   - Subir `.env` a Git
   - Compartir claves por email/chat
   - Usar claves de ejemplo en producción
   - Reutilizar claves entre entornos
   - Loggear valores de secrets

## Recursos Adicionales

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App: Config](https://12factor.net/config)
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Java Cryptography Architecture](https://docs.oracle.com/en/java/javase/17/security/java-cryptography-architecture-jca-reference-guide.html)
