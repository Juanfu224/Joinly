# =============================================================================
# Joinly Backend - Dockerfile Producción (Multi-stage optimizado)
# =============================================================================

# Stage 1: Build
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw package -DskipTests -B -q

# Stage 2: Runtime
FROM eclipse-temurin:25-jre-alpine

LABEL org.opencontainers.image.title="Joinly Backend" \
      org.opencontainers.image.description="Joinly API - Spring Boot" \
      org.opencontainers.image.vendor="Joinly"

ENV JAVA_OPTS="-XX:+UseZGC -Xms256m -Xmx512m -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom" \
    SPRING_PROFILES_ACTIVE="prod" \
    TZ="Europe/Madrid"

RUN apk add --no-cache curl tzdata && \
    addgroup -g 1001 -S app && adduser -u 1001 -S app -G app && \
    mkdir -p /app/logs && chown -R app:app /app

WORKDIR /app
COPY --from=builder --chown=app:app /app/target/joinly-*.jar app.jar

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -sf http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
