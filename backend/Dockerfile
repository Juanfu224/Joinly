# =============================================================================
# Joinly Backend - Dockerfile de Producción
# =============================================================================
# Multi-stage build optimizado para Spring Boot 4 + Java 25
# Características:
#   - Build en contenedor aislado
#   - Imagen final mínima con JRE
#   - Usuario no-root por seguridad
#   - Health check integrado
#   - Optimización de capas para caché
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /app

# Copiar Maven wrapper y pom.xml primero (mejor caché de capas)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dar permisos de ejecución al wrapper
RUN chmod +x mvnw

# Descargar dependencias (capa cacheada si pom.xml no cambia)
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src src

# Compilar aplicación (skip tests - se ejecutan en CI/CD)
RUN ./mvnw package -DskipTests -B

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
FROM eclipse-temurin:25-jre-alpine AS runtime

# Metadatos de la imagen
LABEL maintainer="Joinly Team" \
      version="1.0.0" \
      description="Joinly Backend API - Spring Boot 4"

# Variables de entorno por defecto
# Nota: ZGC está disponible en Java 11+, ZGenerational requiere Java 21+ (removido en 24+)
ENV JAVA_OPTS="-XX:+UseZGC -Xms256m -Xmx512m -XX:+ExitOnOutOfMemoryError" \
    SPRING_PROFILES_ACTIVE="prod" \
    SERVER_PORT="8080" \
    TZ="Europe/Madrid"

# Instalar dependencias mínimas necesarias
RUN apk add --no-cache \
    curl \
    tzdata && \
    # Crear usuario no-root para seguridad
    addgroup -g 1001 -S joinly && \
    adduser -u 1001 -S joinly -G joinly && \
    # Crear directorios necesarios
    mkdir -p /app/logs && \
    chown -R joinly:joinly /app

WORKDIR /app

# Copiar JAR compilado (el nombre es joinly-version.jar según el pom.xml)
COPY --from=builder --chown=joinly:joinly /app/target/joinly-*.jar ./app.jar

# Cambiar a usuario no-root
USER joinly

# Puerto de la aplicación
EXPOSE 8080

# Health check para orquestadores
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Punto de entrada optimizado para Spring Boot
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
