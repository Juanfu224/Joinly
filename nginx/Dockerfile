# =============================================================================
# Joinly Nginx - All-in-One (Frontend + Reverse Proxy)
# =============================================================================

# Stage 1: Build Angular
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit --silent

COPY frontend/ .
RUN npm run build:prod

# Stage 2: Runtime
FROM nginx:alpine

LABEL org.opencontainers.image.title="Joinly Nginx" \
      org.opencontainers.image.description="Joinly - Nginx + Angular SPA"

RUN apk add --no-cache curl openssl tzdata && \
    addgroup -g 1001 -S app && adduser -u 1001 -S app -G app && \
    chown -R app:app /var/cache/nginx /var/log/nginx /var/run && \
    mkdir -p /usr/share/nginx/html /etc/nginx/ssl && \
    chown -R app:app /usr/share/nginx/html /etc/nginx/ssl /etc/nginx

COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=builder --chown=app:app /app/dist/joinly/browser /usr/share/nginx/html
COPY nginx/50x.html /etc/nginx/html/50x.html

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -sf http://localhost/nginx-health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
