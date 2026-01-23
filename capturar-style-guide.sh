#!/bin/bash

# =============================================================================
# SCRIPT PARA CAPTURAR IMÁGENES DEL STYLE GUIDE
# =============================================================================
# Este script documenta el proceso para capturar las imágenes necesarias
# para la documentación de la Fase 3.

# NOTA: Este script debe ejecutarse en un entorno con interfaz gráfica
# y tener instalado el servidor de desarrollo de Angular corriendo.

# =============================================================================
# INSTRUCCIONES PREVIAS
# =============================================================================

# 1. Asegurar que el servidor de desarrollo esté corriendo:
#    cd /home/juanfu224/Documentos/DAW/Proyecto/Joinly/frontend
#    ng serve
#
# 2. Abrir navegador en: http://localhost:4200/style-guide
#
# 3. Usar herramienta de captura (DevTools del navegador o herramienta externa)

# =============================================================================
# CAPTURAS REQUERIDAS
# =============================================================================

OUTPUT_DIR="/home/juanfu224/Documentos/DAW/Proyecto/Joinly/docs/design/images"

echo "============================================================================"
echo "GUÍA PARA CAPTURAR IMÁGENES DEL STYLE GUIDE"
echo "============================================================================"
echo ""
echo "Directorio de salida: $OUTPUT_DIR"
echo "URL del Style Guide: http://localhost:4200/style-guide"
echo ""
echo "============================================================================"
echo "CAPTURAS NECESARIAS (7 imágenes):"
echo "============================================================================"
echo ""
echo "1. style-guide-completo.png"
echo "   - Captura completa de toda la página (scrolleando)"
echo "   - Incluye todas las secciones"
echo "   - Usar 'Take full size screenshot' de DevTools"
echo ""
echo "2. style-guide-botones.png"
echo "   - Captura de la sección 'Botones'"
echo "   - Asegurar que se muestren TODAS las variantes (6 tipos × 5 tamaños)"
echo "   - Incluir ejemplos con iconos y estados (normal, disabled)"
echo ""
echo "3. style-guide-tarjetas.png"
echo "   - Captura de la sección 'Tarjetas'"
echo "   - Incluir TODAS las variantes (feature, action, info, list)"
echo "   - Capturar también las tarjetas especializadas (grupo, suscripción)"
echo ""
echo "4. style-guide-formularios.png"
echo "   - Captura de las secciones de formularios:"
echo "     - Form Input (tipos: text, email, password, number, tel, url)"
echo "     - Form Textarea"
echo "     - Form Select"
echo "     - Form Checkbox"
echo "     - Form Radio Group (vertical e inline)"
echo "   - Incluir estados: normal, con ayuda, con error, requerido, disabled"
echo ""
echo "5. style-guide-navegacion.png"
echo "   - Captura de la sección 'Navegación'"
echo "   - Incluir Breadcrumbs con diferentes niveles"
echo "   - Incluir Tabs con indicador visual"
echo ""
echo "6. style-guide-feedback.png"
echo "   - Captura de las secciones de feedback:"
echo "     - Alertas (4 tipos: success, error, warning, info)"
echo "     - Alertas dismissibles"
echo "     - Toasts (ejemplo visual con botones para mostrar)"
echo "     - Modales (ejemplos de confirmación, informativo, estricto)"
echo ""
echo "7. style-guide-comunicacion.png"
echo "   - Captura de la sección 'Comunicación entre Componentes'"
echo "   - Incluir componentes sender y receiver"
echo "   - Mostrar lista de características implementadas"
echo ""

# =============================================================================
# CAPTURAS OPCIONALES (MEJORAR DOCUMENTACIÓN)
# =============================================================================

echo "============================================================================"
echo "CAPTURAS OPCIONALES (recomendadas para documentación completa):"
echo "============================================================================"
echo ""
echo "8. style-guide-tooltips.png"
echo "9. style-guide-modales.png"
echo "10. style-guide-accordion.png"
echo "11. style-guide-theme-switcher.png"
echo "12. style-guide-logos.png"
echo "13. style-guide-iconos.png"
echo "14. style-guide-avatares.png"
echo ""

# =============================================================================
# USO DE DEVTOOLS DE CHROME/EDGE PARA CAPTURAS
# =============================================================================

echo "============================================================================"
echo "USO DE DEVTOOLS PARA CAPTURAS LIMPIAS:"
echo "============================================================================"
echo ""
echo "Método 1: Captura de nodo específico"
echo "-------------------------------------------"
echo "1. Abrir DevTools (F12)"
echo "2. Ir al panel Elements"
echo "3. Clic derecho en el elemento HTML a capturar"
echo "4. Seleccionar 'Capture node screenshot'"
echo "5. La imagen se descarga automáticamente"
echo ""
echo "Método 2: Captura completa de página"
echo "-------------------------------------------"
echo "1. Abrir DevTools (F12)"
echo "2. Ir al menú (···) en la esquina superior derecha de DevTools"
echo "3. Seleccionar 'More tools' → 'Capture screenshot'"
echo "4. Captura toda la página visible"
echo ""
echo "Método 3: Captura de área específica"
echo "-------------------------------------------"
echo "1. Abrir DevTools (F12)"
echo "2. Ir al menú (···) → 'More tools' → 'Capture area screenshot'"
echo "3. Seleccionar el área a capturar arrastrando el mouse"
echo ""
echo "Método 4: Captura de screenshot completo (scrolleable)"
echo "--------------------------------------------------------"
echo "1. Abrir DevTools (F12)"
echo "2. Habilitar: Settings → Experiments → 'Screenshots'"
echo "3. Usar: (···) → 'Capture full size screenshot'"
echo "   - Esto captura la página completa scrolleando"
echo ""

# =============================================================================
# USO DE HERRAMIENTAS DE LÍNEA DE COMANDOS
# =============================================================================

echo "============================================================================"
echo "USO DE HERRAMIENTAS DE LÍNEA DE COMANDOS (opcional):"
echo "============================================================================"
echo ""
echo "Si tienes estas herramientas instaladas, puedes capturar desde terminal:"
echo ""
echo "# Usar puppeteer (requiere Node.js)"
echo "npx puppeteer screenshots.js"
echo ""
echo "# Usar playwright (requiere Node.js)"
echo "npx playwright screenshot http://localhost:4200/style-guide"
echo ""
echo "# Usar phantomjs (descontinuado pero funcional)"
echo "phantomjs http://localhost:4200/style-guide style-guide.png"
echo ""

# =============================================================================
::: VERIFICACIÓN DE IMÁGENES
# =============================================================================

echo "============================================================================"
echo "VERIFICACIÓN DE IMÁGENES CAPTURADAS:"
echo "============================================================================"
echo ""
echo "Después de capturar, verifica que:"
echo ""
echo "✅ Todas las capturas tienen buena resolución (mínimo 1920x1080)"
echo "✅ Los textos son legibles"
echo "✅ Los colores son correctos (sin comprimir excesivamente)"
echo "✅ Los nombres de archivo siguen el patrón: style-guide-[sección].png"
echo "✅ Las imágenes están en el directorio: $OUTPUT_DIR"
echo "✅ Los tamaños de archivo son razonables (< 500KB cada una)"
echo ""

# =============================================================================
::: GUARDAR SCRIPT DE CAPTURA AUTOMÁTICA (OPCIONAL)
# =============================================================================

cat > "$OUTPUT_DIR/../capture-screenshots.js" << 'EOF'
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/style-guide', { waitUntil: 'networkidle0' });

  // Capturas específicas
  await page.screenshot({ path: 'docs/design/images/style-guide-botones.png', clip: { x: 0, y: 800, width: 1920, height: 600 } });
  await page.screenshot({ path: 'docs/design/images/style-guide-tarjetas.png', clip: { x: 0, y: 1500, width: 1920, height: 800 } });
  
  // Captura completa
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'docs/design/images/style-guide-completo.png', fullPage: true });

  await browser.close();
})();
EOF

echo "============================================================================"
echo "SCRIPT DE CAPTURA AUTOMÁTICA GENERADO:"
echo "============================================================================"
echo "Ubicación: $OUTPUT_DIR/../capture-screenshots.js"
echo ""
echo "Para ejecutar (requiere puppeteer instalado):"
echo "  npm install puppeteer"
echo "  node $OUTPUT_DIR/../capture-screenshots.js"
echo ""

echo "============================================================================"
echo "LISTO PARA CAPTURAR IMÁGENES"
echo "============================================================================"
