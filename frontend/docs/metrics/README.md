# Métricas del Proyecto Joinly

Este directorio contiene las métricas del proyecto generadas automáticamente.

## Scripts Disponibles

```bash
# Métricas individuales
npm run metrics:performance    # Lighthouse (requiere app corriendo)
npm run metrics:bundles        # Tamaño de bundles
npm run metrics:coverage       # Coverage de tests
npm run metrics:quality        # Calidad de código (TypeScript, Prettier, etc.)

# Reporte completo
npm run metrics:report         # Generar reporte consolidado

# Pipeline CI/CD
npm run ci:quick              # Verificación rápida (no tests ni Lighthouse)
npm run ci:full               # Verificación completa (tests + Lighthouse)
```

## Archivos Generados

- `performance.json` - Métricas de Lighthouse
- `bundles.json` - Análisis de tamaño de bundles
- `coverage.json` - Métricas de coverage de tests
- `quality.json` - Métricas de calidad de código
- `report.txt` - Reporte consolidado de todas las métricas

## Objetivos de Calidad

| Categoría    | Objetivo                     |
|-------------|------------------------------|
| Performance  | Lighthouse >80, FCP <1.8s, LCP <2.5s |
| Bundles      | Total <1MB gzip, Main <500KB gzip |
| Coverage     | Statements, branches, functions, lines >50% |
| Calidad      | TypeScript sin errores, Prettier OK |

## Uso en CI/CD

Para integrar en pipelines de CI/CD:

```yaml
# Ejemplo GitHub Actions
- run: npm run ci:quick  # Para PRs rápidos
- run: npm run ci:full   # Para main branch
```

## Notas

- Los scripts guardan historial de métricas para seguimiento
- Lighthouse requiere que la app esté corriendo en http://localhost:4200
- Los reportes HTML se generan en `coverage/` y en la raíz del proyecto
