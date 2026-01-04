#!/bin/bash
# =============================================================================
# Joinly - Script de Despliegue a Producción
# =============================================================================
# Este script automatiza el despliegue completo de la aplicación.
# Uso: ./scripts/deploy.sh [opciones]
#
# Opciones:
#   --build     Reconstruir imágenes Docker
#   --pull      Actualizar imágenes base
#   --restart   Reiniciar servicios sin reconstruir
#   --logs      Mostrar logs después del deploy
#   --help      Mostrar ayuda
# =============================================================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Variables
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BUILD_FLAG=""
PULL_FLAG=""
RESTART_ONLY=false
SHOW_LOGS=false

# =============================================================================
# Funciones
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Joinly - Script de Despliegue"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --build     Reconstruir imágenes Docker"
    echo "  --pull      Actualizar imágenes base antes de construir"
    echo "  --restart   Solo reiniciar servicios (sin reconstruir)"
    echo "  --logs      Mostrar logs después del deploy"
    echo "  --help      Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                    # Deploy normal"
    echo "  $0 --build            # Deploy con rebuild de imágenes"
    echo "  $0 --build --logs     # Deploy con rebuild y mostrar logs"
    echo "  $0 --restart          # Solo reiniciar servicios"
}

check_requirements() {
    log_info "Verificando requisitos..."

    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi

    # Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi

    # Archivo de entorno
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Archivo $ENV_FILE no encontrado"
        log_info "Copia .env.prod.example a .env.prod y configura las variables"
        exit 1
    fi

    # Crear enlace simbólico .env -> .env.prod si no existe
    # Docker Compose busca .env por defecto
    if [ ! -f ".env" ] && [ ! -L ".env" ]; then
        log_info "Creando enlace simbólico .env -> .env.prod"
        ln -sf .env.prod .env
    fi

    # Verificar variables críticas
    source "$ENV_FILE"
    
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "joinly.example.com" ]; then
        log_error "DOMAIN no está configurado correctamente en $ENV_FILE"
        exit 1
    fi

    if [ -z "$JWT_SECRET_KEY" ] || [[ "$JWT_SECRET_KEY" == *"GENERAR"* ]]; then
        log_error "JWT_SECRET_KEY no está configurado en $ENV_FILE"
        exit 1
    fi

    if [ -z "$MYSQL_ROOT_PASSWORD" ] || [[ "$MYSQL_ROOT_PASSWORD" == *"GENERAR"* ]]; then
        log_error "MYSQL_ROOT_PASSWORD no está configurado en $ENV_FILE"
        exit 1
    fi

    log_success "Requisitos verificados correctamente"
}

ensure_ssl_certificates() {
    log_info "Verificando certificados SSL..."
    
    SSL_DIR="$PROJECT_DIR/ssl"
    SSL_CERT="$SSL_DIR/nginx.crt"
    SSL_KEY="$SSL_DIR/nginx.key"
    
    # Crear directorio SSL si no existe
    mkdir -p "$SSL_DIR"
    
    # Verificar si existen certificados válidos
    if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
        log_success "Certificados SSL encontrados"
        return 0
    fi
    
    log_warning "Certificados SSL no encontrados, generando autofirmados..."
    
    # Generar certificado autofirmado
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_KEY" \
        -out "$SSL_CERT" \
        -subj "/CN=${DOMAIN:-localhost}/O=Joinly/C=ES" \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Ajustar permisos para el contenedor nginx (UID 1001)
        chmod 644 "$SSL_CERT" "$SSL_KEY"
        log_success "Certificados SSL autofirmados generados"
        log_warning "NOTA: Para producción, ejecuta ./scripts/init-ssl.sh para obtener certificados de Let's Encrypt"
    else
        log_error "Error al generar certificados SSL"
        exit 1
    fi
}

backup_database() {
    log_info "Creando backup de base de datos..."
    
    BACKUP_DIR="$PROJECT_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/joinly_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Solo si el contenedor existe y está corriendo
    if docker ps -q -f name=joinly-mysql-prod &> /dev/null; then
        docker exec joinly-mysql-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" > "$BACKUP_FILE" 2>/dev/null || true
        
        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            gzip "$BACKUP_FILE"
            log_success "Backup creado: ${BACKUP_FILE}.gz"
        else
            log_warning "No se pudo crear backup (posiblemente primera ejecución)"
            rm -f "$BACKUP_FILE"
        fi
    else
        log_warning "Contenedor MySQL no encontrado, saltando backup"
    fi
}

deploy() {
    log_info "Iniciando despliegue..."
    
    # Cargar variables de entorno
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    if [ "$RESTART_ONLY" = true ]; then
        log_info "Reiniciando servicios..."
        docker compose -f "$COMPOSE_FILE" restart
    else
        # Pull de imágenes base si se solicita
        if [ -n "$PULL_FLAG" ]; then
            log_info "Actualizando imágenes base..."
            docker compose -f "$COMPOSE_FILE" pull
        fi

        # Build si se solicita
        if [ -n "$BUILD_FLAG" ]; then
            log_info "Construyendo imágenes..."
            docker compose -f "$COMPOSE_FILE" build $PULL_FLAG
        fi

        # Deploy
        log_info "Desplegando servicios..."
        docker compose -f "$COMPOSE_FILE" up -d $BUILD_FLAG
    fi

    log_success "Despliegue completado"
}

health_check() {
    log_info "Verificando estado de los servicios..."
    
    echo ""
    docker compose -f "$COMPOSE_FILE" ps
    echo ""

    # Esperar a que los servicios estén healthy
    log_info "Esperando a que los servicios estén listos..."
    
    TIMEOUT=120
    ELAPSED=0
    
    while [ $ELAPSED -lt $TIMEOUT ]; do
        UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | grep -c '"Health": "unhealthy"' || echo "0")
        STARTING=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | grep -c '"Health": "starting"' || echo "0")
        
        if [ "$UNHEALTHY" = "0" ] && [ "$STARTING" = "0" ]; then
            log_success "Todos los servicios están healthy"
            return 0
        fi
        
        sleep 5
        ELAPSED=$((ELAPSED + 5))
        echo -ne "\r${BLUE}[INFO]${NC} Esperando... ($ELAPSED/$TIMEOUT segundos)"
    done
    
    echo ""
    log_warning "Algunos servicios no alcanzaron estado healthy en $TIMEOUT segundos"
    log_info "Revisa los logs para más información: docker compose -f $COMPOSE_FILE logs"
}

show_status() {
    echo ""
    echo "=========================================="
    echo "         ESTADO DEL DESPLIEGUE           "
    echo "=========================================="
    echo ""
    
    # Mostrar URLs
    source "$ENV_FILE"
    echo -e "${GREEN}URLs de la aplicación:${NC}"
    echo "  - Frontend: https://$DOMAIN"
    echo "  - API:      https://$DOMAIN/api"
    echo "  - Swagger:  https://$DOMAIN/swagger-ui/"
    echo ""
    
    # Mostrar estado de contenedores
    echo -e "${GREEN}Estado de contenedores:${NC}"
    docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Uso de recursos
    echo -e "${GREEN}Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker compose -f "$COMPOSE_FILE" ps -q) 2>/dev/null || true
    echo ""
}

cleanup() {
    log_info "Limpiando recursos no utilizados..."
    docker system prune -f --volumes 2>/dev/null || true
    log_success "Limpieza completada"
}

# =============================================================================
# Main
# =============================================================================

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build"
            shift
            ;;
        --pull)
            PULL_FLAG="--pull"
            shift
            ;;
        --restart)
            RESTART_ONLY=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

echo ""
echo "=========================================="
echo "     JOINLY - DESPLIEGUE A PRODUCCIÓN    "
echo "=========================================="
echo ""

# Ejecutar pasos
check_requirements
ensure_ssl_certificates
backup_database
deploy
health_check
show_status

if [ "$SHOW_LOGS" = true ]; then
    echo ""
    log_info "Mostrando logs (Ctrl+C para salir)..."
    docker compose -f "$COMPOSE_FILE" logs -f
fi

echo ""
log_success "¡Despliegue completado exitosamente!"
echo ""
