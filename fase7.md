# Checklist final del proyecto

## Testing unitario
- Tests de componentes principales (mínimo 3)
- Tests de servicios (mínimo 3)
- Tests de pipes personalizados (si los hay)
- Coverage mínimo del 50%

## Testing de integración
- Tests de flujos completos (crear producto, login, checkout, etc.)
- Mocks de servicios HTTP
- Testing de formularios reactivos

## Verificación cross-browser
- Probar en Chrome, Firefox, Safari (si tienes acceso)
- Documentar incompatibilidades encontradas
- Aplicar polyfills si es necesario
- Verificar que Angular compila para navegadores objetivo

## Optimización de rendimiento
- Análisis con Lighthouse Performance (objetivo > 80)
- Lazy loading de módulos verificado
- Tree shaking en producción
- Optimización de bundles (< 500KB initial bundle)

## Build de producción
- ng build --configuration production
- Verificar que no hay errores ni warnings
- Analizar tamaño de bundles con source-map-explorer
- Configurar correctamente base-href

## Despliegue
- Desplegar en la misma URL que DIW
- Verificar que todas las rutas funcionan
- Verificar que llamadas HTTP funcionan en producción
- Configurar correctamente redirects para SPA

## Documentación técnica final
- README completo con setup, arquitectura y deploy
- Guía de contribución
- Changelog de versiones
- Decisiones técnicas justificadas
