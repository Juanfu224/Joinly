# Performance Testing - Punto 8.4

## Fecha: 26 de enero de 2026

---

## 8.4.1 Testing de Carga Backend

### Herramientas Recomendadas

1. **JMeter** (Apache JMeter)
   - **Uso**: Testing de carga HTTP
   - **Instalación**: `brew install jmeter` (Mac), `choco install jmeter` (Windows), `apt install jmeter` (Linux)
   - **Plan de Testing**: Ver plan JMeter en `scripts/performance/backend-load-test.jmx`

2. **Artillery**
   - **Uso**: Testing de carga con Node.js
   - **Instalación**: `npm install -g artillery`
   - **Plan de Testing**: Ver script YAML en `scripts/performance/backend-load-test.yml`

3. **Gatling**
   - **Uso**: Testing de carga con Scala
   - **Instalación**: `brew install gatling` (Mac), `choco install gatling` (Windows)
   - **Plan de Testing**: Ver script Scala en `scripts/performance/backend-load-test.scala`

### Escenarios de Testing

#### 1. Login Concurrente
- **Endpoint**: POST /api/v1/auth/login
- **Usuarios**: 100 concurrentes
- **Duración**: 5 minutos
- **Objetivo**: Tiempo de respuesta <500ms p95
- **Comando**:
  ```bash
  artillery run scripts/performance/backend-load-test.yml
  ```

#### 2. Carga de Dashboard
- **Endpoint**: GET /api/v1/unidades
- **Usuarios**: 200 concurrentes
- **Duración**: 10 minutos
- **Objetivo**: Tiempo de respuesta <200ms p95
- **Comando**:
  ```bash
  jmeter -n -t scripts/performance/backend-load-test.jmx
  ```

#### 3. Operaciones CRUD
- **Endpoints**: POST /api/v1/unidades, PUT /api/v1/suscripciones
- **Usuarios**: 50 concurrentes
- **Duración**: 5 minutos
- **Objetivo**: Tiempo de respuesta <300ms p95
- **Comando**:
  ```bash
  gatling -s scripts/performance/backend-load-test.scala
  ```

### Métricas a Medir

| Métrica | Objetivo | Estado |
|-----------|------------|---------|
| Tiempo de respuesta p95 | <500ms | ⚠️ Pendiente |
| Tiempo de respuesta p99 | <1s | ⚠️ Pendiente |
| Tasa de error | <1% | ⚠️ Pendiente |
| Throughput | >100 req/s | ⚠️ Pendiente |
| CPU (servidor) | <80% | ⚠️ Pendiente |
| Memoria (servidor) | <4GB | ⚠️ Pendiente |

---

## 8.4.2 Testing de Carga Frontend

### Herramientas Recomendadas

1. **Lighthouse** (Chrome DevTools)
   - **Uso**: Métricas de performance y accesibilidad
   - **Instalación**: `npm install -g lighthouse`
   - **Ejecución**:
     ```bash
     lighthouse https://joinly.studio --view
     ```

2. **WebPageTest**
   - **Uso**: Testing de velocidad desde múltiples locaciones
   - **URL**: https://www.webpagetest.org
   - **Objetivo**: TTI <3.5s, LCP <2.5s

3. **Google PageSpeed Insights**
   - **Uso**: Análisis de performance de Google
   - **URL**: https://pagespeed.web.dev
   - **Objetivo**: Score >90

### Métricas Objetivo (Lighthouse)

| Métrica | Objetivo | Actual | Estado |
|-----------|------------|---------|
| Performance Score | >80 | ⚠️ Pendiente |
| FCP (First Contentful Paint) | <1.8s | ⚠️ Pendiente |
| LCP (Largest Contentful Paint) | <2.5s | ⚠️ Pendiente |
| TBT (Total Blocking Time) | <200ms | ⚠️ Pendiente |
| CLS (Cumulative Layout Shift) | <0.1 | ⚠️ Pendiente |
| SI (Speed Index) | <3.4s | ⚠️ Pendiente |
| Accessibility Score | >90 | ⚠️ Pendiente |
| Best Practices Score | >90 | ⚠️ Pendiente |
| SEO Score | >90 | ⚠️ Pendiente |

---

## 8.4.3 Ejecución de Tests

### Backend Load Testing

```bash
# Ir a directorio de scripts
cd scripts/performance

# Ejecutar test con Artillery
artillery run backend-load-test.yml

# Opciones alternativas:
# jmeter -n -t backend-load-test.jmx
# gatling -s backend-load-test.scala
```

### Frontend Performance Testing

```bash
# Ejecutar Lighthouse en producción
lighthouse https://joinly.studio --view --chrome-flags="--headless"

# Opciones:
# --throttling.method=devtools
# --throttling.cpuSlowdownMultiplier=4
# --form-factor=mobile
```

---

## 8.4.4 Optimizaciones Identificadas

### Backend
- **Conexión a base de datos**: Usar HikariCP connection pooling
- **Caching**: Implementar Redis para sesiones y cache
- **Lazy Loading**: Cargar relaciones JPA lazy donde sea posible
- **Indexación**: Verificar índices en tablas críticas
- **N+1 queries**: Identificar y eliminar problemas de N+1

### Frontend
- **Lazy Loading**: Ya implementado con `loadComponent()` ✅
- **OnPush**: Ya implementado en componentes ✅
- **Signals**: Ya implementados para estado local ✅
- **Bundle Splitting**: Verificar en build de producción ✅
- **Tree Shaking**: Activado por defecto en Angular ✅
- **Images**: Usar WebP con `loading="lazy"` ✅
- **Virtual Scroll**: Implementar si hay listas >100 items

---

## Resumen de Pruebas

| Prueba | Estado | Resultado |
|---------|---------|-----------|
| Backend Load (Login) | ⚠️ Pendiente | N/A |
| Backend Load (Dashboard) | ⚠️ Pendiente | N/A |
| Backend Load (CRUD) | ⚠️ Pendiente | N/A |
| Frontend Performance | ⚠️ Pendiente | N/A |
| Frontend Accessibility | ⚠️ Pendiente | N/A |
| Frontend Best Practices | ⚠️ Pendiente | N/A |

---

## Conclusiones

El proyecto tiene las **bases técnicas adecuadas** para rendimiento:

### Fortalezas
1. Lazy Loading implementado en todas las rutas
2. OnPush change detection en componentes
3. Signals para estado local (más eficiente que observables)
4. Tree shaking y code splitting activados
5. Imágenes optimizadas con WebP

### Pendientes
1. **EJECUTAR**: Tests de carga backend con Artillery/JMeter
2. **EJECUTAR**: Lighthouse en producción y documentar scores
3. **MEDIR**: Métricas de rendimiento backend (tiempo respuesta, throughput)
4. **OPTIMIZAR**: Si los tests muestran problemas, aplicar optimizaciones

### Recomendaciones
1. Ejecutar tests de carga antes de despliegue en producción
2. Documentar resultados en `docs/performance/results.md`
3. Comparar resultados con objetivos (Lighthouse >80, tiempo respuesta <500ms)
4. Aplicar optimizaciones si no se cumplen objetivos
5. Considerar caché con Redis si el backend tiene cuellos de botella

---

**Estado de Performance Testing: Pendiente de Ejecución**
- Scripts y planes de testing preparados
- Herramientas recomendadas documentadas
- Requiere ejecución manual de tests en entorno de producción
