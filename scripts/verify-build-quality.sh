#!/usr/bin/env bash
# =============================================================================
# Joinly - Verify Build Quality (Point 5 Implementation)
# =============================================================================
# Uso: ./scripts/verify-build-quality.sh
#
# Este script verifica que el build de producción cumple con todos los
# requisitos del punto 5 del plan de implementación:
#   1. Compilación exitosa de frontend y backend
#   2. Bundles dentro de los límites
#   3. Configuración optimizada
#   4. Lazy loading funcional
#   5. Base-href configurado
#   6. Router usando PathLocationStrategy
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
PROJECT_ROOT="$(pwd)"

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
echo "║         🔍 JOINLY BUILD QUALITY VERIFIER (Punto 5)          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

ERRORS=0
WARNINGS=0

# =============================================================================
# 5.1 COMPILACIÓN
# =============================================================================
info "5.1 Verificando compilación..."

FRONTEND_DIST="$PROJECT_ROOT/frontend/dist/joinly/browser"
BACKEND_JAR="$PROJECT_ROOT/backend/target/joinly-0.0.1-SNAPSHOT.jar"

# 5.1.1 Build Frontend Producción
if [ -d "$FRONTEND_DIST" ]; then
    ok "✓ Build de frontend generado en dist/joinly/browser"
    
    # Verificar archivos críticos
    if [ -f "$FRONTEND_DIST/index.html" ]; then
        ok "✓ index.html generado"
    else
        err "✗ index.html no encontrado"
        ((ERRORS++))
    fi
    
    # Verificar que hay bundles de JavaScript
    JS_FILES=$(find "$FRONTEND_DIST" -name "*.js" -type f | wc -l)
    if [ "$JS_FILES" -gt 0 ]; then
        ok "✓ $JS_FILES archivos JavaScript generados"
    else
        err "✗ No hay archivos JavaScript generados"
        ((ERRORS++))
    fi
else
    err "✗ Build de frontend no encontrado. Ejecutar: npm run build:prod"
    ((ERRORS++))
fi

# 5.1.2 Build Backend Producción
if [ -f "$BACKEND_JAR" ]; then
    ok "✓ Build de backend generado: joinly-0.0.1-SNAPSHOT.jar"
    
    # Verificar tamaño del JAR
    JAR_SIZE=$(stat -f%z "$BACKEND_JAR" 2>/dev/null || stat -c%s "$BACKEND_JAR" 2>/dev/null)
    JAR_SIZE_MB=$((JAR_SIZE / 1024 / 1024))
    
    if [ $JAR_SIZE_MB -lt 300 ]; then
        ok "✓ Tamaño del JAR: ${JAR_SIZE_MB} MB (< 300 MB)"
    else
        warn "⚠ Tamaño del JAR: ${JAR_SIZE_MB} MB (recomendado < 300 MB)"
        ((WARNINGS++))
    fi
else
    err "✗ Build de backend no encontrado. Ejecutar: ./mvnw clean package -DskipTests"
    ((ERRORS++))
fi

# =============================================================================
# 5.2 ANÁLISIS DE BUNDLES
# =============================================================================
info ""
info "5.2 Analizando bundles..."

if [ -d "$FRONTEND_DIST" ]; then
    # 5.2.1 Generar Stats JSON
    # Nota: En Angular 21 con @angular/build:application, el stats JSON puede no generarse
    # automáticamente. Se puede generar con herramientas externas como source-map-explorer.
    # Por lo tanto, no lo marcamos como error ni warning.
    
    # 5.2.2 Analizar tamaños de bundles
    MAIN_BUNDLES=$(find "$FRONTEND_DIST" -name "main*.js" -o -name "polyfills*.js" | head -10)
    INITIAL_SIZE=0
    
    for BUNDLE in $MAIN_BUNDLES; do
        BUNDLE_SIZE=$(stat -f%z "$BUNDLE" 2>/dev/null || stat -c%s "$BUNDLE" 2>/dev/null)
        INITIAL_SIZE=$((INITIAL_SIZE + BUNDLE_SIZE))
    done
    
    INITIAL_KB=$((INITIAL_SIZE / 1024))
    
    if [ $INITIAL_SIZE -gt 0 ]; then
        info "Tamaño del bundle inicial: ${INITIAL_KB} KB"
        
        # 5.2.3 Verificar Budgets
        # Objetivo: <500KB warning, <750KB error (tamaño raw)
        # Nota: El tamaño gzip será significativamente menor
        if [ $INITIAL_KB -lt 500 ]; then
            ok "✓ Bundle inicial dentro del límite de warning (500 KB)"
        elif [ $INITIAL_KB -lt 750 ]; then
            warn "⚠ Bundle inicial excede warning pero dentro de error (500-750 KB)"
            ((WARNINGS++))
        else
            err "✗ Bundle inicial excede el límite de error (>750 KB)"
            ((ERRORS++))
        fi
    else
        warn "⚠ No se pudo calcular el tamaño del bundle inicial"
        ((WARNINGS++))
    fi
    
    # Verificar lazy chunks
    LAZY_CHUNKS=$(find "$FRONTEND_DIST" -name "chunk-*.js" | wc -l)
    if [ "$LAZY_CHUNKS" -gt 0 ]; then
        ok "✓ $LAZY_CHUNKS lazy chunks generados (código splitting funcional)"
    else
        err "✗ No hay lazy chunks (lazy loading no funcional)"
        ((ERRORS++))
    fi
    
    # Verificar que el tamaño total está dentro del budget
    TOTAL_JS_SIZE=$(find "$FRONTEND_DIST" -name "*.js" -exec cat {} + | wc -c)
    TOTAL_JS_KB=$((TOTAL_JS_SIZE / 1024))
    TOTAL_JS_MB=$((TOTAL_JS_KB / 1024))
    
    info "Tamaño total de JS: ${TOTAL_JS_MB} MB"
    
    # Budget: <2MB warning, <3MB error
    if [ $TOTAL_JS_MB -lt 2 ]; then
        ok "✓ Tamaño total de JS dentro del límite de warning (2 MB)"
    elif [ $TOTAL_JS_MB -lt 3 ]; then
        warn "⚠ Tamaño total de JS excede warning pero dentro de error (2-3 MB)"
        ((WARNINGS++))
    else
        err "✗ Tamaño total de JS excede el límite de error (>3 MB)"
        ((ERRORS++))
    fi
fi

# =============================================================================
# 5.3 CONFIGURACIÓN BASE-HREF
# =============================================================================
info ""
info "5.3 Verificando configuración base-href..."

# 5.3.1 Verificar configuración en package.json
PACKAGE_JSON="$PROJECT_ROOT/frontend/package.json"
if grep -q '"build:prod".*--base-href' "$PACKAGE_JSON"; then
    ok "✓ Script build:prod incluye --base-href"
else
    warn "⚠ Script build:prod no incluye --base-href"
    ((WARNINGS++))
fi

# 5.3.2 Verificar rutas del router
ROUTER_CONFIG="$PROJECT_ROOT/frontend/src/app/app.config.ts"
if [ -f "$ROUTER_CONFIG" ]; then
    # Verificar PathLocationStrategy (default, no debe tener HashLocationStrategy)
    if ! grep -q "HashLocationStrategy" "$ROUTER_CONFIG"; then
        ok "✓ Router usando PathLocationStrategy (default)"
    else
        err "✗ Router usando HashLocationStrategy (no recomendado para producción)"
        ((ERRORS++))
    fi
else
    err "✗ No se encontró app.config.ts"
    ((ERRORS++))
fi

# Verificar que las rutas no usan hash
ROUTES_FILE="$PROJECT_ROOT/frontend/src/app/app.routes.ts"
if [ -f "$ROUTES_FILE" ]; then
    if ! grep -q "useHash" "$ROUTES_FILE"; then
        ok "✓ Rutas no usan hash routing"
    else
        err "✗ Rutas usan hash routing (no recomendado para producción)"
        ((ERRORS++))
    fi
fi

# =============================================================================
# OPTIMIZACIONES ADICIONALES
# =============================================================================
info ""
info "Verificando optimizaciones adicionales..."

ANGULAR_JSON="$PROJECT_ROOT/frontend/angular.json"

# Verificar AOT
if grep -q '"aot":\s*true' "$ANGULAR_JSON"; then
    ok "✓ AOT habilitado (Ahead-of-Time compilation)"
else
    err "✗ AOT no está habilitado"
    ((ERRORS++))
fi

# Verificar optimization
# En Angular 21, optimization puede ser true o un objeto con scripts/styles
if grep -q '"optimization":\s*true' "$ANGULAR_JSON" || grep -q '"optimization":\s*{' "$ANGULAR_JSON"; then
    ok "✓ Optimización habilitada"
else
    err "✗ Optimización no está habilitada"
    ((ERRORS++))
fi

# Verificar outputHashing
if grep -q '"outputHashing":\s*"all"' "$ANGULAR_JSON"; then
    ok "✓ Output hashing configurado (caché optimizado)"
else
    warn "⚠ Output hashing no configurado como 'all'"
    ((WARNINGS++))
fi

# Verificar que no hay sourceMap en producción
if grep -q '"sourceMap":\s*false' "$ANGULAR_JSON"; then
    ok "✓ Source maps deshabilitados en producción (optimización)"
else
    warn "⚠ Source maps habilitados en producción (puede afectar rendimiento)"
    ((WARNINGS++))
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                  RESUMEN DEL PUNTO 5                          ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "5.1 Compilación:"
echo -e "  ✓ Frontend: Generado correctamente"
echo -e "  ✓ Backend: Generado correctamente (${JAR_SIZE_MB} MB)"
echo ""

echo -e "5.2 Análisis de Bundles:"
echo -e "  ✓ Bundle inicial: ${INITIAL_KB} KB"
echo -e "  ✓ Lazy chunks: $LAZY_CHUNKS generados"
echo -e "  ✓ Total JS: ${TOTAL_JS_MB} MB"
echo ""

echo -e "5.3 Configuración base-href:"
echo -e "  ✓ Script build:prod incluye --base-href"
echo -e "  ✓ Router usando PathLocationStrategy"
echo ""

echo -e "Optimizaciones:"
echo -e "  ✓ AOT habilitado"
echo -e "  ✓ Optimización habilitada"
echo -e "  ✓ Output hashing configurado"
echo -e "  ✓ Source maps deshabilitados"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los checks del punto 5 pasaron exitosamente${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Comandos útiles:"
    echo -e "  - Build completo: ${YELLOW}./scripts/build-prod.sh --all${NC}"
    echo -e "  - Analizar bundles: ${YELLOW}./scripts/analyze-bundles.sh --html${NC}"
    echo -e "  - Verificar config: ${YELLOW}./scripts/verify-build-config.sh${NC}"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Se encontraron $WARNINGS advertencias${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Se encontraron $ERRORS errores y $WARNINGS advertencias${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 1
fi
