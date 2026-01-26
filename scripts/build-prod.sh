#!/usr/bin/env bash
# =============================================================================
# Joinly - Production Build Script
# =============================================================================
# Uso: ./scripts/build-prod.sh [--frontend] [--backend] [--all] [--analyze]
#
# Este script:
#   1. Build de frontend (Angular) con optimizaciones
#   2. Build de backend (Spring Boot) con Maven
#   3. Análisis de bundles (opcional)
#   4. Verificación de budgets
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="$(pwd)"

BUILD_FRONTEND=false
BUILD_BACKEND=false
ANALYZE_BUNDLES=false

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 🏗️  JOINLY BUILD PRODUCTION                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parsear argumentos
if [ $# -eq 0 ]; then
    BUILD_FRONTEND=true
    BUILD_BACKEND=true
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend) BUILD_FRONTEND=true; shift ;;
        --backend) BUILD_BACKEND=true; shift ;;
        --all) BUILD_FRONTEND=true; BUILD_BACKEND=true; shift ;;
        --analyze) ANALYZE_BUNDLES=true; shift ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --frontend    Solo build de frontend"
            echo "  --backend     Solo build de backend"
            echo "  --all         Build de frontend y backend (default)"
            echo "  --analyze     Analizar bundles después del build"
            echo "  --help        Mostrar esta ayuda"
            exit 0
            ;;
        *) shift ;;
    esac
done

# =============================================================================
# BUILD FRONTEND
# =============================================================================
if [ "$BUILD_FRONTEND" = true ]; then
    info "Iniciando build de frontend..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Verificar dependencias
    command -v node &>/dev/null || err "Node.js no instalado"
    command -v npm &>/dev/null || err "npm no instalado"
    
    info "Instalando dependencias..."
    npm ci --silent || err "Error al instalar dependencias"
    
    info "Limpiando build anterior..."
    rm -rf dist
    
    info "Build de producción (Angular 21)..."
    if npm run build:prod 2>&1; then
        ok "Build de frontend completado"
    else
        err "Error en build de frontend"
    fi
    
    # Verificar que el build se generó correctamente
    if [ ! -d "dist/joinly/browser" ]; then
        err "No se encontró el directorio de build en dist/joinly/browser"
    fi
    
    # Mostrar tamaño del build
    BUILD_SIZE=$(du -sh dist/joinly/browser | cut -f1)
    info "Tamaño del build: $BUILD_SIZE"
    
    cd "$PROJECT_ROOT"
fi

# =============================================================================
# BUILD BACKEND
# =============================================================================
if [ "$BUILD_BACKEND" = true ]; then
    info "Iniciando build de backend..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Verificar dependencias
    command -v java &>/dev/null || err "Java 25 no instalado"
    
    info "Limpiando build anterior..."
    ./mvnw clean --quiet || err "Error al limpiar build anterior"
    
    info "Build de producción (Spring Boot 4)..."
    if ./mvnw package -DskipTests --quiet 2>&1; then
        ok "Build de backend completado"
    else
        err "Error en build de backend"
    fi
    
    # Verificar que el JAR se generó correctamente
    JAR_FILE=$(find target -name "joinly-*.jar" -type f | head -1)
    if [ -z "$JAR_FILE" ]; then
        err "No se encontró el JAR en target/"
    fi
    
    # Mostrar tamaño del JAR
    JAR_SIZE=$(du -sh "$JAR_FILE" | cut -f1)
    info "Tamaño del JAR: $JAR_SIZE"
    
    cd "$PROJECT_ROOT"
fi

# =============================================================================
# ANÁLISIS DE BUNDLES (OPCIONAL)
# =============================================================================
if [ "$ANALYZE_BUNDLES" = true ] && [ "$BUILD_FRONTEND" = true ]; then
    info "Iniciando análisis de bundles..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Verificar que source-map-explorer está instalado
    if ! command -v source-map-explorer &>/dev/null; then
        warn "source-map-explorer no encontrado globalmente, usando npx..."
        npx source-map-explorer dist/joinly/browser/**/*.js
    else
        source-map-explorer dist/joinly/browser/**/*.js
    fi
    
    cd "$PROJECT_ROOT"
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Build de producción completado exitosamente${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "  📦 Frontend: ${GREEN}✓${NC} (dist/joinly/browser)"
fi

if [ "$BUILD_BACKEND" = true ]; then
    echo -e "  📦 Backend:  ${GREEN}✓${NC} (backend/target/joinly-*.jar)"
fi

echo ""
echo -e "  🚀 Para desplegar: ${YELLOW}./scripts/deploy.sh --build${NC}"
echo -e "  📊 Para analizar bundles: ${YELLOW}npm run build:analyze${NC}"
echo ""

exit 0
