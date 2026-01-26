#!/bin/bash

# Script para ejecutar Lighthouse y generar reportes de rendimiento
# Uso: ./scripts/lighthouse-audit.sh [URL]
# Ejemplo: ./scripts/lighthouse-audit.sh http://localhost:4200

set -e

URL=${1:-"http://localhost:4200"}
REPORT_DIR="docs/lighthouse"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

echo "🔍 Ejecutando Lighthouse en: $URL"
echo "📁 Reportes se guardarán en: $REPORT_DIR"

# Crear directorio si no existe
mkdir -p "$REPORT_DIR"

# Ejecutar Lighthouse con las métricas de performance, accessibility, best practices, SEO
echo ""
echo "⚡ Ejecutando análisis completo..."
npx lighthouse "$URL" \
  --output=html,json \
  --output-path="$REPORT_DIR/lighthouse-report-$TIMESTAMP" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet \
  --chrome-flags="--headless --no-sandbox --disable-gpu --disable-software-rasterizer" \
  --throttling-method=devtools \
  --view

echo ""
echo "✅ Análisis completado!"
echo ""
echo "📊 Reportes generados:"
echo "   - HTML: $REPORT_DIR/lighthouse-report-$TIMESTAMP.report.html"
echo "   - JSON: $REPORT_DIR/lighthouse-report-$TIMESTAMP.report.json"
echo ""
echo "🎯 Objetivos:"
echo "   - Performance: >80"
echo "   - Accessibility: >90"
echo "   - Best Practices: >90"
echo "   - SEO: >90"
echo ""
echo "💡 Para ver el reporte HTML:"
echo "   open $REPORT_DIR/lighthouse-report-$TIMESTAMP.report.html"
echo ""
