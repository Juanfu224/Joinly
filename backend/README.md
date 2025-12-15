# Joinly Backend

API REST para la plataforma de gestión de suscripciones compartidas Joinly.

## Descripción

Joinly es una plataforma que permite a grupos de personas (familias, amigos, compañeros) compartir y gestionar suscripciones a servicios de streaming, música, gaming y otros servicios digitales. El backend proporciona una API REST completa con autenticación JWT, gestión de grupos familiares, suscripciones, pagos, disputas y sistema de soporte.

## Tecnologías Utilizadas

- **Java 25**
- **Spring Boot 4.0.0**
- **Spring Security** con JWT
- **Spring Data JPA**
- **MySQL 8.x**
- **Flyway** para migraciones de base de datos
- **Maven** (incluido Maven Wrapper)
- **Swagger/OpenAPI** para documentación de API
- **JUnit 5** y **MockMvc** para testing
- **Lombok** para reducir código boilerplate

## Requisitos Previos

- **Java Development Kit (JDK) 25** o superior
- **Docker y Docker Compose** (recomendado para la base de datos)
- **Git**

### Verificar instalación de Java

```bash
java -version    # Debe mostrar Java 25 o superior
```

**Nota:** No necesitas instalar Maven. El proyecto incluye Maven Wrapper (`./mvnw`).

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Juanfu224/Joinly.git
cd Joinly/backend
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```bash
mysql -u root -p
```

Ejecutar en la consola de MySQL:

```sql
CREATE DATABASE bbdd_joinly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Configurar Variables de Entorno

El proyecto usa variables de entorno para mantener las credenciales y claves secretas fuera del código fuente (buena práctica de seguridad).

**Paso 1:** Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

**Paso 2:** Editar el archivo `.env` con tus valores reales:

```bash
nano .env
```

O usar cualquier editor de texto. El archivo debe contener:

```properties
# Base de datos
DB_URL=jdbc:mysql://localhost:3306/bbdd_joinly
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_mysql

# JWT - Generar claves seguras con: openssl rand -base64 64
JWT_SECRET_KEY=tu_clave_jwt_aleatoria_generada

# Encriptación - Generar con: openssl rand -base64 32
ENCRYPTION_KEY=tu_clave_encriptacion_aleatoria
```

**Generar Claves Seguras:**

```bash
# Generar clave JWT (64 bytes en base64)
openssl rand -base64 64

# Generar clave de encriptación (32 bytes en base64)
openssl rand -base64 32
```

**IMPORTANTE:** 
- El archivo `.env` NO se sube a Git (está en `.gitignore`)
- Cada desarrollador debe tener su propio archivo `.env`
- En producción, usar variables de entorno del sistema o un servicio de gestión de secretos

### 4. Compilar el Proyecto

Desde el directorio `backend/`:

```bash
./mvnw clean install
```

En Windows:

```cmd
mvnw.cmd clean install
```

Esto descargará todas las dependencias necesarias y compilará el proyecto.

### 5. Ejecutar Migraciones de Base de Datos

Las migraciones de Flyway se ejecutan automáticamente al iniciar la aplicación. Flyway creará todas las tablas necesarias según el script `src/main/resources/db/migration/V1__Initial_Schema.sql`.

## Ejecución

### Modo Desarrollo

**Opción 1: Usando el script helper (Recomendado)**

```bash
./run.sh
```

Este script verifica que el archivo `.env` exista y ejecuta la aplicación.

**Opción 2: Ejecutar directamente con Maven**

```bash
./mvnw spring-boot:run
```

En Windows:

```cmd
mvnw.cmd spring-boot:run
```

La aplicación estará disponible en: `http://localhost:8080`

### Modo Producción

Generar un JAR ejecutable:

```bash
./mvnw clean package -DskipTests
```

Ejecutar el JAR:

```bash
java -jar target/joinly-0.0.1-SNAPSHOT.jar
```

### Verificar que la Aplicación Está Funcionando

1. Al iniciar, deberías ver este mensaje en la consola:
```
INFO: Successfully loaded X variables from .env file
```

2. Luego verás:
```
Started JoinlyApplication in X seconds
```

3. Abrir en el navegador:

```
http://localhost:8080/actuator/health
```

Deberías ver una respuesta JSON:

```json
{
  "status": "UP"
}
```

Si ves errores sobre "Illegal base64 character", verifica que el archivo `.env` existe y contiene claves válidas. Regenera las claves siguiendo las instrucciones de la sección anterior.

## Documentación de la API

### Swagger UI

La documentación interactiva de la API está disponible en:

```
http://localhost:8080/swagger-ui.html
```

Desde Swagger UI puedes:
- Ver todos los endpoints disponibles
- Probar los endpoints directamente
- Ver ejemplos de request/response
- Autenticarte con JWT para probar endpoints protegidos

### OpenAPI JSON

El esquema OpenAPI en formato JSON está disponible en:

```
http://localhost:8080/v3/api-docs
```

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

### Obtener un Token

1. **Registrar un usuario:**

```bash
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "nombre": "Usuario Prueba",
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

2. **Iniciar sesión:**

```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

Respuesta:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600000
}
```

### Usar el Token

Incluir el token en el header `Authorization` de las peticiones:

```bash
GET http://localhost:8080/api/v1/usuarios/perfil
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Endpoints Principales

### Autenticación (Público)

- `POST /api/v1/auth/register` - Registrar nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar access token
- `GET /api/v1/auth/validate` - Validar token actual

### Usuarios (Autenticado)

- `GET /api/v1/usuarios/perfil` - Obtener perfil del usuario actual
- `PUT /api/v1/usuarios/perfil` - Actualizar perfil
- `POST /api/v1/usuarios/cambiar-password` - Cambiar contraseña

### Unidades Familiares (Grupos)

- `POST /api/v1/unidades` - Crear grupo familiar
- `GET /api/v1/unidades/{id}` - Obtener detalles del grupo
- `POST /api/v1/unidades/unirse` - Unirse a grupo con código
- `GET /api/v1/unidades/mis-grupos` - Listar mis grupos
- `DELETE /api/v1/unidades/{id}/miembros/{idMiembro}` - Expulsar miembro

### Suscripciones

- `POST /api/v1/suscripciones` - Crear suscripción compartida
- `GET /api/v1/suscripciones/{id}` - Obtener suscripción
- `GET /api/v1/suscripciones/unidad/{idUnidad}` - Listar suscripciones de grupo
- `POST /api/v1/suscripciones/{id}/ocupar-plaza` - Ocupar plaza disponible
- `DELETE /api/v1/suscripciones/{id}/liberar-plaza` - Liberar mi plaza

### Pagos

- `POST /api/v1/pagos` - Registrar pago
- `GET /api/v1/pagos/{id}` - Obtener pago
- `GET /api/v1/pagos/mis-pagos` - Listar mis pagos
- `GET /api/v1/pagos/suscripcion/{id}` - Pagos de una suscripción

### Solicitudes

- `POST /api/v1/solicitudes/grupo` - Solicitar unirse a grupo
- `POST /api/v1/solicitudes/suscripcion` - Solicitar plaza en suscripción
- `GET /api/v1/solicitudes/mis-solicitudes` - Mis solicitudes
- `PUT /api/v1/solicitudes/{id}/aprobar` - Aprobar solicitud
- `PUT /api/v1/solicitudes/{id}/rechazar` - Rechazar solicitud

### Soporte (Requiere rol ADMIN o AGENTE)

- `GET /api/v1/tickets` - Listar tickets de soporte
- `POST /api/v1/tickets` - Crear ticket
- `PUT /api/v1/tickets/{id}/asignar` - Asignar ticket a agente
- `PUT /api/v1/tickets/{id}/cerrar` - Cerrar ticket

## Testing

### Ejecutar Todos los Tests

```bash
./mvnw test
```

### Ejecutar Tests de un Controlador Específico

```bash
./mvnw test -Dtest=AuthControllerIntegrationTest
```

### Ejecutar Tests con Coverage

```bash
./mvnw test jacoco:report
```

El reporte de coverage estará en: `target/site/jacoco/index.html`

### Tests Disponibles

El proyecto incluye tests de integración para:

- `AuthControllerIntegrationTest` - Tests de autenticación (registro, login, refresh)
- `SuscripcionControllerIntegrationTest` - Tests de gestión de suscripciones
- `UnidadFamiliarControllerIntegrationTest` - Tests de grupos familiares
- `PagoControllerIntegrationTest` - Tests de pagos
- Tests unitarios de servicios

Los tests utilizan base de datos H2 en memoria para evitar afectar la base de datos de desarrollo.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/alberti/joinly/
│   │   │   ├── config/              # Configuración (Security, CORS, Swagger)
│   │   │   ├── controllers/         # Controladores REST (10 controladores)
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── auth/           # DTOs de autenticación
│   │   │   │   ├── usuario/        # DTOs de usuario
│   │   │   │   ├── unidad/         # DTOs de unidades familiares
│   │   │   │   ├── suscripcion/    # DTOs de suscripciones
│   │   │   │   ├── pago/           # DTOs de pagos
│   │   │   │   └── ...             # Otros DTOs
│   │   │   ├── entities/            # Entidades JPA (20+ entidades)
│   │   │   │   ├── usuario/        # Usuario, Token, MetodoPago
│   │   │   │   ├── grupo/          # UnidadFamiliar, Miembro, Solicitud
│   │   │   │   ├── suscripcion/    # Suscripción, Plaza, Servicio
│   │   │   │   ├── pago/           # Pago, Disputa
│   │   │   │   ├── notificacion/   # Notificación
│   │   │   │   ├── soporte/        # TicketSoporte, Mensaje
│   │   │   │   └── enums/          # Enumeraciones
│   │   │   ├── exceptions/          # Excepciones personalizadas
│   │   │   ├── repositories/        # Repositorios JPA (10+ repositorios)
│   │   │   ├── security/            # Seguridad JWT
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   ├── services/            # Servicios de negocio (10+ servicios)
│   │   │   └── JoinlyApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/
│   │           └── V1__Initial_Schema.sql
│   └── test/
│       └── java/com/alberti/joinly/
│           ├── controllers/         # Tests de integración
│           └── services/            # Tests unitarios
├── docs/
│   ├── rubrica.txt                  # Rúbrica del proyecto
│   ├── TODO_MEJORAS.md              # Lista de mejoras implementadas
│   └── Modelo ER/                   # Diagrama de base de datos
├── pom.xml
└── README.md
```

## Configuración Adicional

### Cambiar Puerto del Servidor

Editar `application.properties`:

```properties
server.port=9090
```

### Configurar Tiempo de Expiración de Tokens

```properties
# Access token: 1 hora (3600000 ms)
jwt.access-token-expiration=3600000

# Refresh token: 30 días (2592000000 ms)
jwt.refresh-token-expiration=2592000000
```

### Configurar CORS para Frontend

```properties
# Añadir origen del frontend
cors.allowed-origins[0]=http://localhost:4200
cors.allowed-origins[1]=https://tu-dominio.com
```

### Habilitar Logs SQL Detallados

```properties
# Mostrar SQL en consola
spring.jpa.show-sql=true

# Formatear SQL
spring.jpa.properties.hibernate.format_sql=true

# Mostrar parámetros de las queries
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

## Migraciones de Base de Datos

### Crear Nueva Migración

Las migraciones deben seguir el patrón: `V{version}__{description}.sql`

Por ejemplo: `V2__Add_User_Avatar_Column.sql`

Ubicación: `src/main/resources/db/migration/`

```sql
-- V2__Add_User_Avatar_Column.sql
ALTER TABLE usuario ADD COLUMN avatar VARCHAR(500);
```

### Verificar Estado de Migraciones

```sql
SELECT * FROM flyway_schema_history;
```

### Rollback Manual

Flyway no soporta rollback automático en la versión Community. Para hacer rollback:

1. Identificar la versión a la que quieres volver
2. Restaurar backup de la base de datos
3. O crear una migración de corrección (`V3__Rollback_Changes.sql`)

## Solución de Problemas

### Error: "Access denied for user"

Verifica las credenciales de MySQL en el archivo `.env`:

```properties
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### Error: "Could not resolve placeholder 'DB_PASSWORD'"

El archivo `.env` no existe o no está correctamente configurado. Sigue estos pasos:

1. Copia el archivo de ejemplo: `cp .env.example .env`
2. Edita `.env` y completa todas las variables requeridas
3. Reinicia la aplicación

### Error: "Table doesn't exist"

Flyway no ha ejecutado las migraciones. Verifica:

```properties
spring.flyway.baseline-on-migrate=true
spring.jpa.hibernate.ddl-auto=validate
```

Elimina la base de datos y vuélvela a crear para que Flyway la inicialice:

```sql
DROP DATABASE bbdd_joinly;
CREATE DATABASE bbdd_joinly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Port 8080 already in use"

Otro proceso está usando el puerto 8080. Opciones:

1. Cambiar el puerto en `application.properties`
2. Detener el proceso que usa el puerto:

```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID {PID} /F
```

### Tests Fallan por Problemas de Base de Datos

Los tests usan H2 en memoria. Si fallan, verifica:

1. Que las dependencias de test estén en `pom.xml`
2. Que exista `src/test/resources/application.properties` con configuración para H2

### JWT signature does not match

El secreto JWT ha cambiado. Los tokens antiguos ya no son válidos. Solicita un nuevo token con `/api/v1/auth/login`.

### Error: "Invalid AES key length" o problemas de encriptación

La clave de encriptación en `.env` no tiene el formato correcto. Debe ser una clave de 32 bytes en base64:

```bash
# Generar nueva clave
openssl rand -base64 32
```

Copia el resultado en `.env`:

```properties
ENCRYPTION_KEY=clave_generada_aqui
```

## Seguridad y Variables de Entorno

### Archivos Importantes

- **`.env`** - Contiene tus credenciales reales (NO subir a Git)
- **`.env.example`** - Plantilla con valores de ejemplo (SÍ está en Git)
- **`application.properties`** - Referencias a variables de entorno

### Generar Claves Seguras

```bash
# Clave JWT (64 bytes)
openssl rand -base64 64

# Clave de encriptación AES-256 (32 bytes)
openssl rand -base64 32

# Alternativa en Linux/Mac
head -c 64 /dev/urandom | base64  # JWT
head -c 32 /dev/urandom | base64  # AES
```

### Buenas Prácticas

1. **NUNCA** subir el archivo `.env` a Git
2. Cada entorno (desarrollo, staging, producción) debe tener sus propias claves
3. Cambiar todas las claves al pasar a producción
4. En servidores, usar variables de entorno del sistema en lugar de archivos `.env`
5. Rotar las claves periódicamente (cada 3-6 meses)

### Configuración en Producción

En lugar de usar archivo `.env`, configurar variables de entorno en el sistema:

**Linux/Mac:**
```bash
export DB_PASSWORD="contraseña_segura"
export JWT_SECRET_KEY="clave_jwt_segura"
export ENCRYPTION_KEY="clave_aes_segura"
```

**Windows:**
```cmd
set DB_PASSWORD=contraseña_segura
set JWT_SECRET_KEY=clave_jwt_segura
set ENCRYPTION_KEY=clave_aes_segura
```

**Docker:**
```yaml
environment:
  - DB_PASSWORD=contraseña_segura
  - JWT_SECRET_KEY=clave_jwt_segura
  - ENCRYPTION_KEY=clave_aes_segura
```

**Servicios Cloud (AWS, Azure, etc.):**
- AWS: Systems Manager Parameter Store o Secrets Manager
- Azure: Key Vault
- Google Cloud: Secret Manager
- Heroku: Config Vars

## Información de Contacto

- **Proyecto:** Joinly - Plataforma de Suscripciones Compartidas
- **Autor:** Juan
- **Repositorio:** https://github.com/Juanfu224/Joinly
- **Módulo:** Desarrollo Web en Entorno Servidor (DWES)
- **Curso:** DAW

## Licencia

Este proyecto es parte de un trabajo académico para el ciclo de Desarrollo de Aplicaciones Web (DAW).
