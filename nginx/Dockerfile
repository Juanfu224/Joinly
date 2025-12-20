# =============================================================================
# Joinly Nginx - All-in-One Server (Frontend + Reverse Proxy)
# =============================================================================
# Multi-stage build que compila Angular y sirve todo desde Nginx
# - Compila Angular 21
# - Sirve SPA estática
# - Proxy inverso para API
# =============================================================================

# Stage 1: Build Angular
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci --prefer-offline --no-audit

# Copiar código fuente
COPY frontend/ .

# Build Angular
RUN npm run build -- --configuration=production

# Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Metadatos
LABEL maintainer="Joinly Team" \
      version="1.0.0" \
      description="Joinly - Nginx + Angular SPA"

# Instalar utilidades necesarias
RUN apk add --no-cache \
    curl \
    tzdata

# Crear usuario no-root
RUN addgroup -g 1001 -S joinly && \
    adduser -u 1001 -S joinly -G joinly && \
    chown -R joinly:joinly /var/cache/nginx && \
    chown -R joinly:joinly /var/log/nginx && \
    chown -R joinly:joinly /var/run && \
    mkdir -p /usr/share/nginx/html && \
    chown -R joinly:joinly /usr/share/nginx/html

# Copiar configuración de Nginx como template
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template

# Copiar script de entrada
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    chown -R joinly:joinly /etc/nginx/

# Copiar archivos compilados de Angular
COPY --from=builder --chown=joinly:joinly /app/dist/joinly/browser /usr/share/nginx/html

# Copiar página de error
COPY nginx/50x.html /etc/nginx/html/50x.html

# Cambiar usuario
USER joinly

# Puerto
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Entrypoint y comando
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
