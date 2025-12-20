# =============================================================================
# Joinly Frontend - Dockerfile de Producción
# =============================================================================
# Multi-stage build optimizado para Angular 21
# Características:
#   - Build en contenedor con Node.js
#   - Imagen final ultra-ligera con Nginx Alpine
#   - Configuración de Nginx optimizada para SPA
#   - Usuario no-root por seguridad
#   - Compresión gzip habilitada
#   - Cache headers optimizados
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (clean install para reproducibilidad)
RUN npm ci --prefer-offline --no-audit

# -----------------------------------------------------------------------------
# Stage 2: Build
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build -- --configuration=production

# -----------------------------------------------------------------------------
# Stage 3: Runtime
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runtime

# Metadatos de la imagen
LABEL maintainer="Joinly Team" \
      version="1.0.0" \
      description="Joinly Frontend - Angular 21"

# Instalar tzdata para zona horaria
RUN apk add --no-cache tzdata && \
    # Crear usuario no-root
    addgroup -g 1001 -S joinly && \
    adduser -u 1001 -S joinly -G joinly && \
    # Ajustar permisos de Nginx
    chown -R joinly:joinly /var/cache/nginx && \
    chown -R joinly:joinly /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R joinly:joinly /var/run/nginx.pid && \
    # Crear directorio para archivos estáticos
    mkdir -p /usr/share/nginx/html && \
    chown -R joinly:joinly /usr/share/nginx/html

# Copiar configuración de Nginx optimizada
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados de Angular
COPY --from=builder --chown=joinly:joinly /app/dist/joinly/browser /usr/share/nginx/html

# Cambiar a usuario no-root
USER joinly

# Puerto de la aplicación
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:4200/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
