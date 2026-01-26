# ADR-006: Por qué Docker Multi-Stage Builds

## Status

Accepted

## Context

Joinly necesita ser desplegado en producción de manera eficiente y reproducible. Los requisitos de despliegue son:

1. Imágenes Docker pequeñas (menor bandwidth, faster deploys)
2. Build reproducible
3. Separación de dependencias y application code
4. Imágenes seguras (sin herramientas de build en producción)
5. Soporte para desarrollo y producción
6. Facilidad de CI/CD integration

Las opciones de Docker builds consideradas:

1. **Single-Stage Build**
2. **Multi-Stage Build**
3. **Build from Source (no Docker)**
4. **Docker Compose con volúmenes**
5. **Cloud-Native Buildpacks**

## Decision

Hemos elegido **Docker Multi-Stage Builds** para frontend y backend.

### Arquitectura de Multi-Stage Build:

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND BUILD                            │
├─────────────────────────────────────────────────────────────────┤
│  Stage 1: Builder (Node.js)                                    │
│  - FROM node:20-alpine                                         │
│  - WORKDIR /app                                                │
│  - COPY package*.json ./                                       │
│  - RUN npm ci                                                  │
│  - COPY . ./                                                   │
│  - RUN npm run build                                           │
│  - Result: dist/ directory                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ COPY --from=builder
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 2: Production (Nginx)                                   │
│  - FROM nginx:alpine                                           │
│  - COPY --from=builder /app/dist /usr/share/nginx/html        │
│  - COPY nginx.conf /etc/nginx/conf.d/default.conf             │
│  - Result: Minimal nginx image with only static files          │
│  - Size: ~30MB (vs ~500MB single-stage)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND BUILD                             │
├─────────────────────────────────────────────────────────────────┤
│  Stage 1: Builder (OpenJDK 25)                                │
│  - FROM eclipse-temurin:25-jdk-alpine                         │
│  - WORKDIR /app                                                │
│  - COPY pom.xml ./                                             │
│  - RUN ./mvnw dependency:go-offline                           │
│  - COPY src ./src                                              │
│  - RUN ./mvnw clean package -DskipTests                       │
│  - Result: target/*.jar                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ COPY --from=builder
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 2: Production (OpenJRE 25)                             │
│  - FROM eclipse-temurin:25-jre-alpine                         │
│  - WORKDIR /app                                                │
│  - COPY --from=builder /app/target/*.jar app.jar               │
│  - Result: Minimal JRE image with only JAR                     │
│  - Size: ~200MB (vs ~600MB single-stage)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Razones:

1. **Imágenes Drásticamente Más Pequeñas**

   Multi-stage builds permiten copiar solo lo necesario:

   ```dockerfile
   # Single-Stage (Frontend)
   FROM node:20-alpine
   WORKDIR /app
   COPY . .
   RUN npm install && npm run build
   # Size: ~500MB (includes node_modules, build tools, source)
   
   # Multi-Stage (Frontend)
   # Stage 1: Builder
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY . .
   RUN npm install && npm run build
   
   # Stage 2: Production
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   # Size: ~30MB (only static files, nginx)
   
   # Reduction: ~94% smaller!
   ```

   **Tamaños de Imágenes:**

   | Aplicación | Single-Stage | Multi-Stage | Reducción |
   |------------|-------------|-------------|-----------|
   | Frontend (Angular) | ~500MB | ~30MB | **94%** |
   | Backend (Spring Boot) | ~600MB | ~200MB | **67%** |

2. **Imágenes Más Seguras**

   Al eliminar herramientas de build de la imagen final:

   ```dockerfile
   # Multi-Stage - Solo contiene JRE y el JAR
   FROM eclipse-temurin:25-jre-alpine
   COPY --from=builder /app/target/*.jar app.jar
   
   # No contiene:
   # - Maven (mvnw)
   # - JDK (javac)
   # - Source code
   # - Build tools
   # - Dependencies de desarrollo
   ```

   **Beneficios de seguridad:**
   - Menor superficie de ataque
   - No hay herramientas de build que puedan ser explotadas
   - Solo contiene lo necesario para ejecutar

3. **Layers Optimizados**

   Docker cachea layers de build:

   ```dockerfile
   # Multi-Stage - Layers optimizados
   FROM node:20-alpine AS builder
   WORKDIR /app
   
   # Layer 1: Package files (cached si no cambian)
   COPY package*.json ./
   RUN npm ci
   
   # Layer 2: Source code (rebuilt solo si cambia)
   COPY . .
   RUN npm run build
   ```

   **Beneficios de caching:**
   - Builds más rápidos en CI/CD
   - Solo rebuild lo que cambió
   - Menor bandwidth en pushes

4. **Separación de Responsabilidades**

   Builder stage y production stage tienen roles claros:

   ```dockerfile
   # Builder: Responsable de compilar
   FROM node:20-alpine AS builder
   # - Instala dependencias
   # - Compila código
   # - Genera artifacts
   # No ejecuta la aplicación
   
   # Production: Responsable de ejecutar
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   # - Solo contiene artifacts compilados
   # - Ejecuta la aplicación
   # No tiene herramientas de build
   ```

5. **Flexibilidad de Base Images**

   Se pueden usar diferentes bases para builder y production:

   ```dockerfile
   # Builder: Use Node.js con todas las herramientas
   FROM node:20-alpine AS builder
   
   # Production: Use nginx ultra-liviano
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   ```

   **Beneficios:**
   - Builder puede tener herramientas pesadas
   - Production puede usar base liviana
   - Optimizado para cada stage

6. **Reproducibility de Builds**

   Multi-stage builds son más determinísticos:

   ```bash
   # Build reproducible
   docker build --no-cache -t joinly-frontend:1.0.0 .
   
   # Siempre genera la misma imagen si el código no cambia
   # Sin dependencias del host (node_modules locales, etc.)
   ```

## Dockerfiles del Proyecto

### Frontend Dockerfile

```dockerfile
# =====================
# Stage 1: Builder
# =====================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
ARG BASE_HREF=/
RUN npm run build -- --base-href $BASE_HREF

# =====================
# Stage 2: Production
# =====================
FROM nginx:alpine

# Copy build from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
# =====================
# Stage 1: Builder
# =====================
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests -B

# =====================
# Stage 2: Production
# =====================
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from builder
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# JVM options
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Start application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  # Frontend (Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        BASE_HREF: /
    image: joinly-frontend:1.0.0
    container_name: joinly-frontend-prod
    ports:
      - "80:80"
    networks:
      - joinly-network
    restart: unless-stopped
    depends_on:
      - backend

  # Backend (Spring Boot)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: joinly-backend:1.0.0
    container_name: joinly-backend-prod
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=joinly
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    networks:
      - joinly-network
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy

  # MySQL
  mysql:
    image: mysql:8.0
    container_name: joinly-mysql-prod
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USERNAME}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - joinly-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql-data:
    driver: local

networks:
  joinly-network:
    driver: bridge
```

## Consecuencias

### Positivas:

1. **Imágenes Pequeñas**
   - 94% reduction en frontend (500MB → 30MB)
   - 67% reduction en backend (600MB → 200MB)
   - Menor bandwidth en deploys
   - Faster pulls en production

2. **Más Seguras**
   - Menor superficie de ataque
   - No contiene herramientas de build
   - Solo lo necesario para ejecutar
   - Compliance con security best practices

3. **Builds Más Rápidos**
   - Better caching de layers
   - Solo rebuild lo que cambió
   - Menor bandwidth en CI/CD

4. **Reproducibles**
   - Builds determinísticos
   - Sin dependencias del host
   - Mismo resultado siempre

5. **Flexibilidad**
   - Diferentes bases para builder y production
   - Optimizado para cada stage
   - Fácil de customizar

### Negativas:

1. **Complexity Incremental**
   - Dockerfiles más complejos
   - Más stages que entender
   - Debugging más difícil (qué stage falló?)

2. **Build Time Inicial Mayor**
   - Primera build más lenta (todos los stages)
   - Pero subsequent builds son más rápidos por caching

3. **Learning Curve**
   - Concepto de multi-stage builds
   - Cómo usar COPY --from
   - Cómo optimizar layers

## Alternativas Consideradas

### Single-Stage Build

**Ventajas:**
- Más simple
- Menor learning curve
- Más fácil de debug

**Desventajas:**
- Imágenes gigantes (500-600MB)
- Menos seguras (contiene build tools)
- Más bandwidth en deploys
- Más lento en pulls

**No elegido porque:**
- Imágenes pequeñas son críticas para producción
- Security es prioridad
- Multi-stage es estándar en Docker moderno

### Build from Source (no Docker)

**Ventajas:**
- Sin overhead de Docker
- Más control

**Desventajas:**
- No reproducible
- No portable
- Difícil de deploy
- No es cloud-native

**No elegido porque:**
- Docker es estándar en deployments modernos
- Reproducibilidad es crítica

### Docker Compose con Volúmenes

**Ventajas:**
- Más simple para desarrollo
- No requiere rebuild

**Desventajas:**
- No es reproducible (depends on host)
- No es portable (host-specific)
- No es production-ready

**No elegido porque:**
- Multi-stage es más portable
- Reproducibilidad es crítica

### Cloud-Native Buildpacks

**Ventajas:**
- Zero-config
- Optimizado automáticamente
- Cloud-native

**Desventajas:**
- Less control
- Menos transparente
- Vendor lock-in (partial)

**No elegido porque:**
- Multi-stage da más control
- Más transparente
- Sin vendor lock-in

## Referencias

- [Docker Docs - Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Best Practices - Multi-Stage](https://docs.docker.com/develop/dev-best-practices/)
- [Spring Boot - Docker](https://spring.io/guides/topicals/spring-boot-docker/)
- [Angular - Docker](https://angular.dev/tools/cli/docker)

---

**Fecha de Decisión:** 2024-09-01
**Decidido por:** Juan Alberto Fuentes
**Estado:** Accepted
