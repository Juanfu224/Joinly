#!/bin/bash
# =============================================================================
# Joinly - Script de Despliegue a Producción
# =============================================================================
# Este script automatiza el despliegue completo de la aplicación con buenas
# prácticas de seguridad, robustez y observabilidad.
#
# Uso: ./scripts/deploy.sh [opciones]
#
# Opciones:
#   --build     Reconstruir imágenes Docker
#   --pull      Actualizar imágenes base
#   --restart   Reiniciar servicios sin reconstruir
#   --logs      Mostrar logs después del deploy
#   --help      Mostrar ayuda
#
# Requiere:
#   - Docker v20.10+
#   - Docker Compose v2.0+
#   - Archivo .env.prod configurado
# =============================================================================

set -euo pipefail  # Salir si hay errores, variables no definidas o errores en pipes

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

# Log file
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/deploy_$(date +%Y%m%d_%H%M%S).log"

# =============================================================================
# Funciones
# =============================================================================

log_to_file() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log_to_file "[INFO] $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log_to_file "[SUCCESS] $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log_to_file "[WARNING] $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log_to_file "[ERROR] $1"
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
    log_info "Verificando requisitos del sistema..."

    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    log_info "Docker $DOCKER_VERSION encontrado"

    # Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose v2+ no está instalado"
        exit 1
    fi
    COMPOSE_VERSION=$(docker compose version | awk '{print $4}')
    log_info "Docker Compose $COMPOSE_VERSION encontrado"

    # Archivo de entorno
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Archivo $ENV_FILE no encontrado"
        log_info "Copia .env.prod.example a .env.prod y configura las variables"
        exit 1
    fi

    # Verificar permisos
    if [ ! -r "$ENV_FILE" ]; then
        log_error "Permiso de lectura denegado para $ENV_FILE"
        exit 1
    fi

    # Verificar variables críticas
    source "$ENV_FILE"
    
    MISSING_VARS=0
    
    if [ -z "${DOMAIN:-}" ] || [ "$DOMAIN" = "joinly.example.com" ]; then
        log_error "DOMAIN no está configurado correctamente"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi

    if [ -z "${JWT_SECRET_KEY:-}" ] || [[ "$JWT_SECRET_KEY" == *"GENERAR"* ]]; then
        log_error "JWT_SECRET_KEY no está configurado"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi

    if [ -z "${MYSQL_ROOT_PASSWORD:-}" ] || [[ "$MYSQL_ROOT_PASSWORD" == *"GENERAR"* ]]; then
        log_error "MYSQL_ROOT_PASSWORD no está configurado"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi

    if [ -z "${ENCRYPTION_KEY:-}" ]; then
        log_error "ENCRYPTION_KEY no está configurado"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi

    if [ $MISSING_VARS -gt 0 ]; then
        log_error "$MISSING_VARS variable(s) crítica(s) sin configurar"
        exit 1
    fi

    log_success "Todos los requisitos verificados correctamente"
}

backup_database() {
    log_info "Creando backup de base de datos..."
    
    BACKUP_DIR="$PROJECT_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/joinly_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Solo si el contenedor existe y está corriendo
    if docker ps -q -f name=joinly-mysql-prod &> /dev/null; then
        # Cargar variables para el backup
        source "$ENV_FILE"
        
        # Crear backup con error handling
        if docker exec joinly-mysql-prod mysqldump \
            -u root \
            -p"$MYSQL_ROOT_PASSWORD" \
            "$MYSQL_DATABASE" \
            > "$BACKUP_FILE" 2>/dev/null; then
            
            if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
                # Comprimir backup
                gzip -9 "$BACKUP_FILE"
                BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
                log_success "Backup creado: ${BACKUP_FILE}.gz (tamaño: $BACKUP_SIZE)"
                log_to_file "Backup exitoso: ${BACKUP_FILE}.gz"
            else
                log_warning "Archivo de backup vacío"
                rm -f "$BACKUP_FILE"
            fi
        else
            log_warning "No se pudo crear backup de la BD"
        fi
    else
        log_info "Contenedor MySQL no está corriendo - primer despliegue"
    fi
}

deploy() {
    log_info "Iniciando despliegue..."
    
    # Cargar variables de entorno - IMPORTANTE: usar --env-file
    # De lo contrario docker-compose solo lee .env (no .env.prod)
    log_info "Cargando variables de entorno desde $ENV_FILE..."

    if [ "$RESTART_ONLY" = true ]; then
        log_info "Reiniciando servicios..."
        docker compose \
            --env-file "$ENV_FILE" \
            -f "$COMPOSE_FILE" \
            restart
    else
        # Pull de imágenes base si se solicita
        if [ -n "$PULL_FLAG" ]; then
            log_info "Actualizando imágenes base..."
            docker compose \
                --env-file "$ENV_FILE" \
                -f "$COMPOSE_FILE" \
                pull
        fi

        # Build si se solicita
        if [ -n "$BUILD_FLAG" ]; then
            log_info "Construyendo imágenes..."
            docker compose \
                --env-file "$ENV_FILE" \
                -f "$COMPOSE_FILE" \
                build $PULL_FLAG
        fi

        # Deploy
        log_info "Desplegando servicios..."
        docker compose \
            --env-file "$ENV_FILE" \
            -f "$COMPOSE_FILE" \
            up -d $BUILD_FLAG
    fi

    log_success "Despliegue completado"
}

health_check() {
    log_info "Verificando estado de los servicios..."
    
    echo ""
    docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        ps
    echo ""

    # Esperar a que los servicios estén healthy
    log_info "Esperando a que los servicios estén listos..."
    
    TIMEOUT=300  # Aumentado a 5 minutos para migraciones de BD
    ELAPSED=0
    
    while [ $ELAPSED -lt $TIMEOUT ]; do
        # Verificar si hay contenedores unhealthy o starting
        UNHEALTHY=$(docker compose \
            --env-file "$ENV_FILE" \
            -f "$COMPOSE_FILE" \
            ps --format json 2>/dev/null | grep -c '"Health": "unhealthy"' || echo "0")
        STARTING=$(docker compose \
            --env-file "$ENV_FILE" \
            -f "$COMPOSE_FILE" \
            ps --format json 2>/dev/null | grep -c '"Health": "starting"' || echo "0")
        
        if [ "$UNHEALTHY" = "0" ] && [ "$STARTING" = "0" ]; then
            log_success "Todos los servicios están healthy"
            return 0
        fi
        
        sleep 5
        ELAPSED=$((ELAPSED + 5))
        # Mostrar progreso sin saltar línea
        printf "\r${BLUE}[INFO]${NC} Esperando... ($ELAPSED/$TIMEOUT segundos)"
    done
    
    echo ""
    log_warning "⚠️  Algunos servicios no alcanzaron estado healthy en $TIMEOUT segundos"
    log_info "Revisa los logs: docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs"
    log_info "Verificando logs de error..."
    docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        logs --tail=50 backend || true
}

show_status() {
    echo ""
    echo "=========================================="
    echo "         ESTADO DEL DESPLIEGUE           "
    echo "=========================================="
    echo ""
    
    # Mostrar URLs
    if [ -f "$ENV_FILE" ]; then
        source "$ENV_FILE"
        echo -e "${GREEN}URLs de la aplicación:${NC}"
        echo "  - Frontend: https://$DOMAIN"
        echo "  - API:      https://$DOMAIN/api"
        echo "  - Swagger:  https://$DOMAIN/swagger-ui/"
        echo ""
    fi
    
    # Mostrar estado de contenedores
    echo -e "${GREEN}Estado de contenedores:${NC}"
    docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Uso de recursos
    echo -e "${GREEN}Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
        $(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q) 2>/dev/null || true
    echo ""
    
    # Información de seguridad
    echo -e "${YELLOW}Checklist de Seguridad:${NC}"
    echo "  [ ] .env.prod no subido a Git"
    echo "  [ ] Certificados SSL en lugar"
    echo "  [ ] Firewall configurado correctamente"
    echo "  [ ] Backups automatizados en marcha"
    echo "  [ ] Logs centralizados y monitoreados"
    echo ""
}

cleanup() {
    log_info "Limpiando recursos no utilizados..."
    docker system prune -f 2>/dev/null || true
    log_success "Limpieza completada"
}

# =============================================================================
# Trap para limpiar en caso de error
# =============================================================================

trap 'log_error "Script interrumpido o error detectado"; exit 1' ERR INT TERM

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
log_to_file "=== INICIO DEL DESPLIEGUE ==="

# Ejecutar pasos
check_requirements
backup_database
deploy
health_check
show_status

if [ "$SHOW_LOGS" = true ]; then
    echo ""
    log_info "Mostrando logs (Ctrl+C para salir)..."
    docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        logs -f
fi

echo ""
log_success "✅ ¡Despliegue completado exitosamente!"
log_to_file "=== DESPLIEGUE COMPLETADO EXITOSAMENTE ==="
log_to_file "Log guardado en: $LOG_FILE"
echo "📋 Logs guardados en: $LOG_FILE"
echo ""
