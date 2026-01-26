# Guía de Configuración Completa - Joinly

Esta guía detalla el proceso completo para configurar el entorno de desarrollo y producción de Joinly.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación en Windows](#instalación-en-windows)
- [Instalación en macOS](#instalación-en-macos)
- [Instalación en Linux](#instalación-en-linux)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Hardware Mínimo

- **CPU**: 2 núcleos o superior
- **RAM**: 8 GB (recomendado 16 GB)
- **Disco**: 20 GB disponibles
- **Red**: Conexión a internet estable

### Software Requerido

| Software | Versión Mínima | Notas |
|----------|----------------|-------|
| **Java Development Kit (JDK)** | 25+ | Oracle JDK o OpenJDK |
| **Node.js** | 18+ | LTS recomendado (v20) |
| **npm** | 9+ | Incluido con Node.js |
| **Docker** | 24+ | Para MySQL en desarrollo |
| **Docker Compose** | 2+ | Para orquestar contenedores |
| **Git** | 2.30+ | Para control de versiones |
| **Maven** | 3.9+ | Incluido en el proyecto (mvnw) |

### Software Opcional

- **DBeaver** o **MySQL Workbench**: Para explorar la base de datos
- **Postman** o **Insomnia**: Para probar la API REST
- **VS Code**: Editor de código recomendado
  - Extensiones recomendadas: Java Extension Pack, Angular Essentials, ESLint

---

## Instalación en Windows

### 1. Instalar Java 25

```powershell
# Descargar desde https://www.oracle.com/java/technologies/downloads/#java25
# O usar un gestor de paquetes:

# Usando Winget
winget install Oracle.JDK.25

# Usando Chocolatey
choco install openjdk25

# Verificar instalación
java -version
# Output: openjdk version "25" 2024-09-17
```

### 2. Instalar Node.js 18+

```powershell
# Descargar desde https://nodejs.org/
# Usar la versión LTS recomendada

# O usar un gestor de paquetes:

# Usando Winget
winget install OpenJS.NodeJS.LTS

# Verificar instalación
node -v
# Output: v20.11.0

npm -v
# Output: 10.2.4
```

### 3. Instalar Docker Desktop

```powershell
# Descargar desde https://www.docker.com/products/docker-desktop/
# Ejecutar el instalador con las opciones por defecto

# Verificar instalación
docker --version
# Output: Docker version 24.0.7, build afdd53b

docker compose version
# Output: Docker Compose version v2.23.0
```

### 4. Instalar Git

```powershell
# Descargar desde https://git-scm.com/download/win
# Ejecutar el instalador con las opciones por defecto

# Verificar instalación
git --version
# Output: git version 2.43.0.windows.1
```

### 5. Configurar Git (Opcional pero recomendado)

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global core.autocrlf true
```

---

## Instalación en macOS

### 1. Instalar Homebrew (si no está instalado)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Añadir Homebrew al PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 2. Instalar Java 25

```bash
# Usar Homebrew
brew install openjdk@25

# Crear enlace simbólico
sudo ln -sfn /opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-25.jdk

# Verificar instalación
java -version
# Output: openjdk version "25" 2024-09-17
```

### 3. Instalar Node.js 18+

```bash
# Usar Homebrew
brew install node

# Verificar instalación
node -v
# Output: v20.11.0

npm -v
# Output: 10.2.4
```

### 4. Instalar Docker Desktop

```bash
# Usar Homebrew Cask
brew install --cask docker

# Abrir Docker Desktop y seguir el asistente de instalación

# Verificar instalación
docker --version
# Output: Docker version 24.0.7, build afdd53b
```

### 5. Instalar Git

```bash
# Homebrew lo instala por defecto
git --version
# Output: git version 2.43.0

# Configurar Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## Instalación en Linux (Ubuntu/Debian)

### 1. Instalar Java 25

```bash
# Usar apt (OpenJDK)
sudo apt update
sudo apt install openjdk-25-jdk

# Verificar instalación
java -version
# Output: openjdk version "25" 2024-09-17

# Configurar JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. Instalar Node.js 18+

```bash
# Usar NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node -v
# Output: v20.11.0

npm -v
# Output: 10.2.4
```

### 3. Instalar Docker

```bash
# Instalar dependencias
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Añadir clave GPG oficial de Docker
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Añadir repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Añadir usuario al grupo docker (necesario logout/login)
sudo usermod -aG docker $USER

# Verificar instalación
docker --version
# Output: Docker version 24.0.7, build afdd53b
```

### 4. Instalar Git

```bash
sudo apt install git

# Verificar instalación
git --version
# Output: git version 2.43.0

# Configurar Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## Configuración del Entorno de Desarrollo

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/Juanfu224/Joinly.git
cd Joinly

# O si tienes acceso privado:
git clone git@github.com:Juanfu224/Joinly.git
cd Joinly
```

### 2. Configurar Variables de Entorno

```bash
# Copiar plantilla de variables de entorno
cp .env.example .env

# Editar archivo .env
# En Windows usar notepad o VS Code
notepad .env

# En macOS/Linux usar nano
nano .env
```

**Contenido del archivo .env:**

```env
# Base de Datos
DB_HOST=mysql
DB_PORT=3306
DB_NAME=joinly
DB_USERNAME=root
DB_PASSWORD=root_password

# Spring Boot
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# JWT
JWT_SECRET_KEY=generar_con_openssl_rand_base64_64
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# Encriptación
ENCRYPTION_KEY=generar_con_openssl_rand_base64_32

# CORS
CORS_ALLOWED_ORIGIN=http://localhost:4200
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*

# Frontend
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:8080
```

**Generar claves seguras:**

```bash
# Generar clave JWT SECRET KEY (64 bytes)
openssl rand -base64 64

# Generar clave ENCRYPTION KEY (32 bytes)
openssl rand -base64 32
```

### 3. Iniciar MySQL con Docker

```bash
# Iniciar contenedor MySQL
docker compose up -d

# Verificar que está corriendo
docker ps
# Deberías ver un contenedor con nombre "joinly-mysql-1"

# Ver logs de MySQL
docker compose logs mysql
```

### 4. Ejecutar Backend

**Opción A: Con Maven Wrapper (Recomendado)**

```bash
cd backend

# Linux/macOS
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Windows (PowerShell)
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

# Windows (CMD)
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

**Opción B: Con Maven instalado**

```bash
cd backend

# Ejecutar
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Primera vez (descargar dependencias)
mvn clean install
```

**Verificar que el backend está corriendo:**

```bash
# En otra terminal
curl http://localhost:8080/actuator/health
# Output: {"status":"UP"}

# O abrir en navegador
# http://localhost:8080/swagger-ui.html
```

### 5. Ejecutar Frontend

```bash
cd frontend

# Instalar dependencias (primera vez)
npm install

# Ejecutar en modo desarrollo
npm start

# El frontend estará disponible en http://localhost:4200
```

**Nota**: Si aparece el mensaje `Would you like to share anonymous usage data`, responder `No`.

### 6. Verificar Instalación Completa

```bash
# 1. Verificar backend
curl http://localhost:8080/actuator/health
# Output: {"status":"UP"}

# 2. Verificar frontend
# Abrir http://localhost:4200 en navegador

# 3. Verificar MySQL
docker ps | grep mysql
# Output: a1b2c3d4e5f6   mysql:8.0   ...

# 4. Verificar Swagger
# Abrir http://localhost:8080/swagger-ui.html en navegador
```

---

## Configuración de Variables de Entorno

### Variables de Backend (.env)

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

### Variables de Frontend (frontend/src/app/core/config/api.config.ts)

```typescript
export const API_CONFIG = {
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};
```

### Variables de Producción (.env.prod)

```env
# Para producción, usar valores seguros y únicos

DB_HOST=joinly-mysql-prod
DB_PORT=3306
DB_NAME=joinly_prod
DB_USERNAME=joinly_user
DB_PASSWORD=tu_password_seguro_aqui

SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

JWT_SECRET_KEY=generar_nueva_clave_para_produccion
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000

ENCRYPTION_KEY=generar_nueva_clave_para_produccion

CORS_ALLOWED_ORIGIN=https://joinly.studio
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*
```

---

## Ejecución del Proyecto

### Usando Make (Recomendado)

El proyecto incluye un Makefile para facilitar la ejecución:

```bash
# Ver todos los comandos disponibles
make help

# Iniciar entorno de desarrollo (MySQL + Backend)
make start

# Iniciar frontend en otra terminal
make frontend

# Ver estado de servicios
make status

# Detener todos los servicios
make stop

# Ejecutar tests
make test

# Limpiar archivos generados
make clean

# Build de producción
make build
```

### Ejecución Manual

#### Backend

```bash
# Entrar en directorio backend
cd backend

# Ejecutar tests
./mvnw test

# Ejecutar en desarrollo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Build para producción
./mvnw clean package -DskipTests

# Ejecutar JAR de producción
java -jar target/joinly-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
# Entrar en directorio frontend
cd frontend

# Ejecutar tests
npm test

# Ejecutar en modo watch
npm test -- --watch

# Ejecutar con coverage
npm run test:coverage

# Ejecutar en desarrollo
npm start

# Build para producción
npm run build

# Build con análisis de bundles
npm run build -- --stats-json

# Servir build de producción localmente
npx serve dist/joinly/browser
```

---

## Troubleshooting

### Problema: Puerto 8080 ya está en uso

**Error**: `Port 8080 is already in use`

**Solución**:

```bash
# Linux/macOS
lsof -ti:8080 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

### Problema: Puerto 4200 ya está en uso

**Error**: `Port 4200 is already in use`

**Solución**:

```bash
# Linux/macOS
lsof -ti:4200 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 4200).OwningProcess | Stop-Process -Force
```

### Problema: MySQL no conecta

**Error**: `Communications link failure`

**Solución**:

```bash
# Verificar que Docker está corriendo
docker ps

# Ver logs de MySQL
docker compose logs mysql

# Reiniciar MySQL
docker compose restart mysql

# Esperar 10-15 segundos para que MySQL inicie completamente
```

### Problema: mvnw no tiene permisos de ejecución

**Error**: `Permission denied: ./mvnw`

**Solución**:

```bash
# Linux/macOS
chmod +x backend/mvnw

# Windows no necesita permisos, usar mvnw.cmd
```

### Problema: npm install falla

**Error**: `npm ERR! code EINTEGRITY`

**Solución**:

```bash
# Limpiar cache de npm
npm cache clean --force

# Borrar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Problema: Frontend no conecta al backend

**Error**: `Network error`, `ERR_CONNECTION_REFUSED`

**Solución**:

1. Verificar que el backend está corriendo: `curl http://localhost:8080/actuator/health`
2. Verificar que el puerto 8080 no está bloqueado por firewall
3. Verificar la configuración de CORS en el backend
4. Verificar la configuración de API URL en el frontend

### Problema: Token JWT inválido

**Error**: `JWT strings must contain exactly 2 period characters`

**Solución**:

1. Verificar que las variables de entorno están configuradas
2. Regenerar `JWT_SECRET_KEY` con `openssl rand -base64 64`
3. Reiniciar el backend
4. Limpiar sessionStorage en el navegador

### Problema: Migraciones de Flyway fallan

**Error**: `FlywayException: Validate failed`

**Solución**:

```bash
# En desarrollo, limpiar la base de datos
docker compose down -v
docker compose up -d

# O ejecutar Flyway clean (solo en desarrollo)
cd backend
./mvnw flyway:clean -Dflyway.configFiles=src/main/resources/db/migration/flyway.conf
```

### Problema: Docker no tiene permisos

**Error**: `permission denied while trying to connect to the Docker daemon socket`

**Solución**:

```bash
# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a iniciar sesión
# O ejecutar:
newgrp docker
```

### Problema: OutOfMemoryError en el backend

**Error**: `java.lang.OutOfMemoryError: Java heap space`

**Solución**:

```bash
# Aumentar memoria disponible para Maven
export MAVEN_OPTS="-Xmx1024m -Xms512m"

# O en Windows
set MAVEN_OPTS=-Xmx1024m -Xms512m

# Ejecutar de nuevo
./mvnw spring-boot:run
```

---

## Próximos Pasos

Una vez configurado el entorno:

1. **Explorar el código**: Lee la documentación de arquitectura en `docs/ARCHITECTURE.md`
2. **Leer las guías de desarrollo**:
   - `docs/CONTRIBUTING.md` - Guía de contribución
   - `backend/README.md` - Documentación del backend
   - `frontend/README.md` - Documentación del frontend
3. **Ejecutar tests**: `npm test` (frontend) y `./mvnw test` (backend)
4. **Desarrollar tu primera feature**: Crea una rama y haz un commit
5. **Revisar la API**: Abre `http://localhost:8080/swagger-ui.html`

---

## Recursos Adicionales

- [Documentación de Java 25](https://docs.oracle.com/en/java/javase/25/)
- [Documentación de Spring Boot 4.0](https://docs.spring.io/spring-boot/docs/4.0.0/reference/html/)
- [Documentación de Angular 21](https://angular.dev/)
- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/)

---

## Soporte

Si encuentras algún problema no documentado aquí:

1. Busca en los Issues de GitHub: https://github.com/Juanfu224/Joinly/issues
2. Revisa el archivo `README.md` para más información
3. Consulta la documentación de arquitectura en `docs/ARCHITECTURE.md`
4. Crea un nuevo Issue con el error y pasos para reproducirlo

---

**Última actualización**: 26 de enero de 2026
**Versión**: 1.0.0
