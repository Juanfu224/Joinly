#!/usr/bin/env bash
# =============================================================================
# Joinly - Verify Production Build Configuration
# =============================================================================
# Uso: ./scripts/verify-build-config.sh
#
# Este script verifica que la configuración de build de producción
# está correctamente configurada según las mejores prácticas de Angular 21.
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
echo "║            🔍 JOINLY BUILD CONFIG VERIFIER                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

ERRORS=0
WARNINGS=0

# =============================================================================
# 1. VERIFICAR FRONTEND
# =============================================================================
info "Verificando configuración de frontend..."

FRONTEND_DIR="$PROJECT_ROOT/frontend"
ANGULAR_JSON="$FRONTEND_DIR/angular.json"
PACKAGE_JSON="$FRONTEND_DIR/package.json"

# Verificar Angular CLI
if [ -f "$ANGULAR_JSON" ]; then
    ok "✓ angular.json encontrado"
    
    # Verificar configuración de producción
    if grep -q '"production"' "$ANGULAR_JSON"; then
        ok "✓ Configuración de producción existe"
        
        # Verificar AOT
        if grep -q '"aot":\s*true' "$ANGULAR_JSON"; then
            ok "✓ AOT habilitado en producción"
        else
            err "✗ AOT no está habilitado en producción"
            ((ERRORS++))
        fi
        
        # Verificar optimización
        # En Angular 21, optimization puede ser true o un objeto con scripts/styles
        if grep -q '"optimization":\s*true' "$ANGULAR_JSON" || grep -q '"optimization":\s*{' "$ANGULAR_JSON"; then
            ok "✓ Optimización habilitada"
        else
            err "✗ Optimización no está habilitada"
            ((ERRORS++))
        fi
        
        # En Angular 21 con @angular/build:application, buildOptimizer está incluido en optimization: true
        # No es necesario verificarlo por separado
        # Nota: El buildOptimizer está automáticamente habilitado en modo producción
        
        # Verificar outputHashing
        if grep -q '"outputHashing":\s*"all"' "$ANGULAR_JSON"; then
            ok "✓ Output hashing configurado"
        else
            warn "⚠ Output hashing podría mejorar para caché"
            ((WARNINGS++))
        fi
        
        # Verificar budgets
        if grep -q '"budgets"' "$ANGULAR_JSON"; then
            ok "✓ Budgets configurados"
            
            # Verificar límites razonables
            if grep -q '"maximumWarning":\s*"500kB"' "$ANGULAR_JSON"; then
                ok "✓ Budget de warning configurado a 500KB"
            else
                warn "⚠ Budget de warning no es 500KB (recomendado)"
                ((WARNINGS++))
            fi
        else
            err "✗ No hay budgets configurados"
            ((ERRORS++))
        fi
    else
        err "✗ No hay configuración de producción"
        ((ERRORS++))
    fi
else
    err "✗ No se encontró angular.json"
    ((ERRORS++))
fi

# Verificar scripts de build
if [ -f "$PACKAGE_JSON" ]; then
    ok "✓ package.json encontrado"
    
    # Verificar script build:prod
    if grep -q '"build:prod"' "$PACKAGE_JSON"; then
        ok "✓ Script build:prod existe"
        
        if grep -q '"build:prod".*--base-href' "$PACKAGE_JSON"; then
            ok "✓ Script build:prod incluye base-href"
        else
            warn "⚠ Script build:prod no incluye --base-href"
            ((WARNINGS++))
        fi
    else
        err "✗ No existe script build:prod"
        ((ERRORS++))
    fi
    
    # Verificar script build:stats
    if grep -q '"build:stats"' "$PACKAGE_JSON"; then
        ok "✓ Script build:stats existe"
    else
        warn "⚠ No existe script build:stats"
        ((WARNINGS++))
    fi
    
    # Verificar script build:analyze
    if grep -q '"build:analyze"' "$PACKAGE_JSON"; then
        ok "✓ Script build:analyze existe"
    else
        warn "⚠ No existe script build:analyze"
        ((WARNINGS++))
    fi
    
    # Verificar source-map-explorer
    if grep -q '"source-map-explorer"' "$PACKAGE_JSON"; then
        ok "✓ source-map-explorer instalado"
    else
        err "✗ source-map-explorer no instalado"
        ((ERRORS++))
    fi
else
    err "✗ No se encontró package.json"
    ((ERRORS++))
fi

# Verificar router config
ROUTER_CONFIG="$FRONTEND_DIR/src/app/app.config.ts"
if [ -f "$ROUTER_CONFIG" ]; then
    ok "✓ Configuración de router encontrada"
    
    # Verificar PathLocationStrategy (default, no debería tener HashLocationStrategy)
    if ! grep -q "HashLocationStrategy" "$ROUTER_CONFIG"; then
        ok "✓ PathLocationStrategy configurado (default)"
    else
        err "✗ HashLocationStrategy está configurado (no recomendado para producción)"
        ((ERRORS++))
    fi
    
    # Verificar ViewTransitions
    if grep -q "withViewTransitions" "$ROUTER_CONFIG"; then
        ok "✓ ViewTransitions habilitado"
    else
        warn "⚠ ViewTransitions no habilitado"
        ((WARNINGS++))
    fi
    
    # Verificar preloading
    if grep -q "withPreloading" "$ROUTER_CONFIG"; then
        ok "✓ Preloading configurado"
    else
        warn "⚠ Preloading no configurado"
        ((WARNINGS++))
    fi
else
    err "✗ No se encontró app.config.ts"
    ((ERRORS++))
fi

# Verificar lazy loading en rutas
ROUTES_FILE="$FRONTEND_DIR/src/app/app.routes.ts"
if [ -f "$ROUTES_FILE" ]; then
    ok "✓ Archivo de rutas encontrado"
    
    # Contar rutas con loadComponent
    LOAD_COMPONENT_COUNT=$(grep -c "loadComponent:" "$ROUTES_FILE" || echo "0")
    if [ "$LOAD_COMPONENT_COUNT" -gt 0 ]; then
        ok "✓ $LOAD_COMPONENT_COUNT rutas con lazy loading (loadComponent)"
    else
        err "✗ No hay rutas con lazy loading"
        ((ERRORS++))
    fi
else
    err "✗ No se encontró app.routes.ts"
    ((ERRORS++))
fi

# =============================================================================
# 2. VERIFICAR BACKEND
# =============================================================================
info ""
info "Verificando configuración de backend..."

BACKEND_DIR="$PROJECT_ROOT/backend"
POM_XML="$BACKEND_DIR/pom.xml"

if [ -f "$POM_XML" ]; then
    ok "✓ pom.xml encontrado"
    
    # Verificar Spring Boot version
    if grep -q "<version>4.0.2</version>" "$POM_XML"; then
        ok "✓ Spring Boot 4.0.2 configurado"
    else
        warn "⚠ Versión de Spring Boot no es 4.0.2"
        ((WARNINGS++))
    fi
    
    # Verificar Java version
    if grep -q "<java.version>25</java.version>" "$POM_XML"; then
        ok "✓ Java 25 configurado"
    else
        warn "⚠ Versión de Java no es 25"
        ((WARNINGS++))
    fi
    
    # Verificar Spring Boot Maven Plugin
    if grep -q "spring-boot-maven-plugin" "$POM_XML"; then
        ok "✓ Spring Boot Maven Plugin configurado"
    else
        err "✗ Spring Boot Maven Plugin no configurado"
        ((ERRORS++))
    fi
else
    err "✗ No se encontró pom.xml"
    ((ERRORS++))
fi

# Verificar mvnw wrapper
if [ -f "$BACKEND_DIR/mvnw" ]; then
    ok "✓ Maven Wrapper encontrado"
else
    warn "⚠ Maven Wrapper no encontrado"
    ((WARNINGS++))
fi

# =============================================================================
# 3. VERIFICAR SCRIPTS DE BUILD
# =============================================================================
info ""
info "Verificando scripts de build..."

if [ -f "$PROJECT_ROOT/scripts/build-prod.sh" ]; then
    ok "✓ Script build-prod.sh existe"
    
    if [ -x "$PROJECT_ROOT/scripts/build-prod.sh" ]; then
        ok "✓ Script build-prod.sh es ejecutable"
    else
        err "✗ Script build-prod.sh no es ejecutable"
        ((ERRORS++))
    fi
else
    err "✗ No existe script build-prod.sh"
    ((ERRORS++))
fi

if [ -f "$PROJECT_ROOT/scripts/analyze-bundles.sh" ]; then
    ok "✓ Script analyze-bundles.sh existe"
    
    if [ -x "$PROJECT_ROOT/scripts/analyze-bundles.sh" ]; then
        ok "✓ Script analyze-bundles.sh es ejecutable"
    else
        err "✗ Script analyze-bundles.sh no es ejecutable"
        ((ERRORS++))
    fi
else
    err "✗ No existe script analyze-bundles.sh"
    ((ERRORS++))
fi

# =============================================================================
# 4. RESUMEN FINAL
# =============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los checks pasaron exitosamente${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
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
