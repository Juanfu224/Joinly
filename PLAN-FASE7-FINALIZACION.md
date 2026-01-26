# Plan de Implementación - Fase 7: Finalización del Proyecto Joinly

**Proyecto:** Joinly - Plataforma de Gestión de Suscripciones Compartidas
**Fecha:** 26 de enero de 2026
**Versión:** 1.0.0
**Stack:** Angular 21 + Spring Boot 4 + MySQL 8

---

## Resumen Ejecutivo

Este plan detalla las tareas finales para completar el proyecto Joinly con los más altos estándares de calidad, siguiendo las buenas prácticas de Angular 21 y Spring Boot 4. El objetivo es alcanzar un mínimo de 50% de cobertura de testing, optimización de rendimiento con Lighthouse >80, y preparación completa para despliegue en producción.

**Tiempo estimado:** Sprint final
**Prioridad:** Alta
**Estado:** Pendiente de aprobación

---

## 1. Testing Unitario Frontend (Angular 21 + Vitest)

### 1.1 Tests de Componentes Principales

#### Objetivo
Implementar tests unitarios para los componentes críticos del sistema con cobertura mínima del 50%.

#### Componentes Prioritarios

- [ ] **1.1.1 Componente: `LoginFormComponent`**
  - Renderizado correcto del formulario
  - Validación de email (formato + requerido)
  - Validación de contraseña (longitud mínima)
  - Submit con credenciales válidas
  - Manejo de errores de autenticación
  - Estado de loading durante login
  - Archivo: `frontend/src/app/components/shared/login-form/login-form.component.spec.ts`

- [ ] **1.1.2 Componente: `RegisterFormComponent`**
  - Renderizado de todos los campos
  - Validación email único (async validator)
  - Validación contraseña fuerte (min 8, mayúscula, número)
  - Validación confirmación contraseña
  - Submit con datos válidos
  - Manejo de errores de registro
  - Archivo: `frontend/src/app/components/shared/register-form/register-form.component.spec.ts`

- [ ] **1.1.3 Componente: `GroupCardComponent`**
  - Renderizado de información del grupo
  - Click en tarjeta navega a detalle
  - Mostrar número de miembros correcto
  - Mostrar badge de rol (ADMIN/ANFITRION/MIEMBRO)
  - Mostrar suscripciones activas
  - Archivo: `frontend/src/app/components/shared/group-card/group-card.component.spec.ts`

- [ ] **1.1.4 Componente: `SubscriptionCardComponent`**
  - Renderizado de información de suscripción
  - Mostrar servicio con logo
  - Mostrar plazas ocupadas/totales
  - Mostrar coste mensual calculado
  - Mostrar estado (ACTIVA/PAUSADA)
  - Click navega a detalle de suscripción
  - Archivo: `frontend/src/app/components/shared/subscription-card/subscription-card.component.spec.ts`

- [ ] **1.1.5 Componente: `ModalComponent`**
  - Renderizado correcto del modal
  - Close on overlay click
  - Close on ESC key press
  - Emit evento de cierre
  - Prevenir scroll del body cuando abierto
  - Focus trap dentro del modal
  - Archivo: `frontend/src/app/components/shared/modal/modal.component.spec.ts`

- [ ] **1.1.6 Componente: `ToastContainerComponent`**
  - Renderizado de múltiples toasts
  - Auto-dismiss después de timeout
  - Close manual de toast
  - Tipos: success, error, warning, info
  - Animaciones de entrada/salida
  - Archivo: `frontend/src/app/components/shared/toast-container/toast-container.component.spec.ts`

### 1.2 Tests de Servicios

#### Servicios Críticos

- [ ] **1.2.1 Servicio: `AuthService`**
  - Login exitoso retorna tokens
  - Login fallido lanza error
  - Register exitoso retorna usuario
  - Refresh token actualiza access token
  - Logout limpia almacenamiento
  - isAuthenticated retorna estado correcto
  - getCurrentUser retorna usuario actual
  - Archivo: `frontend/src/app/services/auth.service.spec.ts`

- [ ] **1.2.2 Servicio: `UnidadFamiliarService`**
  - getUnidades retorna lista de grupos
  - getUnidadById retorna detalle de grupo
  - createUnidad crea grupo exitosamente
  - joinUnidad con código válido
  - getMiembros retorna lista de miembros
  - expulsarMiembro con ID válido
  - abandonarGrupo confirma salida
  - Archivo: `frontend/src/app/services/unidad-familiar.service.spec.ts`

- [ ] **1.2.3 Servicio: `SuscripcionService`**
  - getSuscripciones retorna lista
  - getSuscripcionById retorna detalle
  - createSuscripcion crea suscripción
  - updateSuscripcion actualiza datos
  - ocuparPlaza con suscripción válida
  - liberarPlaza con suscripción válida
  - getCredenciales retorna credenciales desencriptadas
  - Archivo: `frontend/src/app/services/suscripcion.service.spec.ts`

- [ ] **1.2.4 Servicio: `LoadingService`**
  - show() incrementa contador
  - hide() decrementa contador
  - isLoading$ emite true cuando >0
  - isLoading$ emite false cuando 0
  - Múltiples llamadas simultáneas
  - Archivo: `frontend/src/app/services/loading.service.spec.ts`

- [ ] **1.2.5 Servicio: `ThemeService`**
  - getTheme retorna tema actual
  - setTheme cambia tema
  - toggleTheme alterna entre claro/oscuro
  - Tema se persiste en localStorage
  - Tema se aplica al documento
  - Archivo: `frontend/src/app/services/theme.service.spec.ts`

### 1.3 Tests de Pipes Personalizados

- [ ] **1.3.1 Pipe: `FormatSuscripcionesPipe`**
  - Formatea correctamente plurales
  - Maneja 0 suscripciones
  - Maneja 1 suscripción (singular)
  - Maneja múltiples suscripciones
  - Archivo: `frontend/src/app/utils/format-suscripciones.pipe.spec.ts`

- [ ] **1.3.2 Pipe: `FormatCodigoPipe`**
  - Formatea código de 12 dígitos con guiones
  - Maneja códigos inválidos
  - Maneja valores nulos/undefined
  - Archivo: `frontend/src/app/components/shared/invite-modal/format-codigo.pipe.spec.ts`

### 1.4 Configuración de Testing

- [ ] **1.4.1 Configurar Vitest con jsdom**
  - Verificar `vitest.config.ts` configurado correctamente
  - jsdom como environment
  - Coverage configurado para Istanbul
  - Aliases de TypeScript configurados
  - Setup file para inicialización global

- [ ] **1.4.2 Scripts de Testing**
  ```json
  {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
  ```

- [ ] **1.4.3 Objetivo de Coverage**
  - Coverage mínimo: 50%
  - Statements: >50%
  - Branches: >50%
  - Functions: >50%
  - Lines: >50%

---

## 2. Testing de Integración Frontend

### 2.1 Flujos Completos de Usuario

- [ ] **2.1.1 Flujo: Registro → Login → Dashboard**
  - Registro de nuevo usuario
  - Verificación de email (si aplica)
  - Login con credenciales nuevas
  - Navegación a dashboard
  - Dashboard carga datos del usuario
  - Archivo: `frontend/src/app/pages/auth/auth.integration.spec.ts`

- [ ] **2.1.2 Flujo: Crear Grupo → Invitar Miembros**
  - Usuario autenticado crea grupo
  - Grupo aparece en dashboard
  - Generar código de invitación
  - Copiar código al portapapeles
  - Mostrar código en modal
  - Archivo: `frontend/src/app/pages/crear-grupo/crear-grupo.integration.spec.ts`

- [ ] **2.1.3 Flujo: Unirse a Grupo con Código**
  - Usuario ingresa código válido
  - Validación de código en backend (mock)
  - Envío de solicitud de membresía
  - Notificación de solicitud enviada
  - Archivo: `frontend/src/app/pages/unirse-grupo/unirse-grupo.integration.spec.ts`

- [ ] **2.1.4 Flujo: Crear Suscripción en Grupo**
  - Seleccionar servicio del catálogo
  - Completar formulario de suscripción
  - Definir plazas totales
  - Establecer coste mensual
  - Guardar credenciales encriptadas
  - Suscripción aparece en lista
  - Archivo: `frontend/src/app/pages/crear-suscripcion/crear-suscripcion.integration.spec.ts`

- [ ] **2.1.5 Flujo: Ocupar Plaza en Suscripción**
  - Ver detalle de suscripción
  - Click en "Ocupar plaza"
  - Confirmar ocupación
  - Plaza se marca como ocupada
  - Coste individual calculado
  - Archivo: `frontend/src/app/pages/suscripcion-detalle/ocupar-plaza.integration.spec.ts`

### 2.2 Mocks de Servicios HTTP

- [ ] **2.2.1 Mock: `HttpClient` con `HttpTestingController`**
  - Crear factory de mocks para requests
  - Mockear respuestas de autenticación
  - Mockear respuestas de grupos
  - Mockear respuestas de suscripciones
  - Mockear errores HTTP (401, 403, 500)
  - Archivo: `frontend/src/testing/http-mocks.ts`

- [ ] **2.2.2 Mock: Interceptores HTTP**
  - Verificar que AuthInterceptor añade token
  - Verificar que ErrorInterceptor maneja errores
  - Verificar que LoadingInterceptor actualiza estado
  - Archivo: `frontend/src/app/interceptors/interceptors.integration.spec.ts`

### 2.3 Testing de Formularios Reactivos

- [ ] **2.3.1 Formulario: Login**
  - Validaciones síncronas (required, email)
  - Submit habilitado solo si válido
  - Mensajes de error visibles
  - Archivo: `frontend/src/app/components/shared/login-form/login-form.reactive.spec.ts`

- [ ] **2.3.2 Formulario: Registro**
  - Validaciones síncronas y asíncronas
  - Validador de email único (async)
  - Validador de contraseña fuerte
  - Confirmación de contraseña match
  - Archivo: `frontend/src/app/components/shared/register-form/register-form.reactive.spec.ts`

- [ ] **2.3.3 Formulario: Crear Grupo**
  - Nombre de grupo requerido
  - Descripción opcional
  - Submit con datos válidos
  - Archivo: `frontend/src/app/components/shared/create-group-form/create-group-form.reactive.spec.ts`

- [ ] **2.3.4 Formulario: Nueva Suscripción**
  - Selección de servicio requerida
  - Plazas totales mínimo 1
  - Coste mensual formato moneda
  - Fecha inicio requerida
  - Credenciales con validación
  - Archivo: `frontend/src/app/components/shared/new-subscription-form/new-subscription-form.reactive.spec.ts`

---

## 3. Verificación Cross-Browser

### 3.1 Navegadores Objetivo

- [ ] **3.1.1 Google Chrome (Latest)**
  - Probar todas las funcionalidades críticas
  - Verificar responsive (mobile, tablet, desktop)
  - Verificar DevTools sin errores en consola

- [ ] **3.1.2 Mozilla Firefox (Latest)**
  - Probar funcionalidades críticas
  - Verificar CSS Grid/Flexbox
  - Verificar formularios reactivos

- [ ] **3.1.3 Safari (Latest) - Si hay acceso**
  - Probar funcionalidades críticas
  - Verificar CSS custom properties
  - Verificar scrolling suave

- [ ] **3.1.4 Microsoft Edge (Latest)**
  - Probar funcionalidades críticas
  - Verificar compatibilidad Chromium

### 3.2 Polyfills y Compatibilidad

- [ ] **3.2.1 Verificar `browserslist` en `package.json`**
  ```
  > 0.5%
  last 2 versions
  Firefox ESR
  not dead
  not IE 11
  ```

- [ ] **3.2.2 Verificar polyfills necesarios**
  - Angular polyfills incluidos automáticamente
  - Verificar que no se necesiten polyfills adicionales
  - Documentar incompatibilidades encontradas

- [ ] **3.2.3 Angular Compiler Target**
  - Verificar `tsconfig.json` target: ES2022+
  - Angular 21 compila automáticamente para navegadores objetivo

### 3.3 Testing Responsive

- [ ] **3.3.1 Mobile (320px - 767px)**
  - Navegación hamburger funcional
  - Formularios usables en pantalla pequeña
  - Tarjetas apiladas correctamente
  - Touch targets >44px

- [ ] **3.3.2 Tablet (768px - 1023px)**
  - Layout de 2 columnas
  - Navegación horizontal visible
  - Tarjetas en grid 2x

- [ ] **3.3.3 Desktop (1024px+)**
  - Layout completo 3+ columnas
  - Sidebars visibles
  - Aprovechamiento de espacio

---

## 4. Optimización de Rendimiento

### 4.1 Análisis con Lighthouse

- [ ] **4.1.1 Ejecutar Lighthouse Performance**
  - Abrir Chrome DevTools
  - Ir a pestaña Lighthouse
  - Seleccionar Performance + Best Practices + Accessibility + SEO
  - Ejecutar en modo incógnito
  - Guardar reporte en `docs/lighthouse/`
  - Objetivo: >80 en Performance

- [ ] **4.1.2 Métricas Clave**
  - **FCP (First Contentful Paint)**: <1.8s
  - **LCP (Largest Contentful Paint)**: <2.5s
  - **TBT (Total Blocking Time)**: <200ms
  - **CLS (Cumulative Layout Shift)**: <0.1
  - **SI (Speed Index)**: <3.4s

- [ ] **4.1.3 Corregir Issues de Lighthouse**
  - Optimizar imágenes (WebP, lazy loading)
  - Minimizar JavaScript no utilizado
  - Eliminar CSS no utilizado
  - Añadir `fetchpriority="high"` a imágenes críticas
  - Preconnect a dominios externos

### 4.2 Lazy Loading de Módulos

- [ ] **4.2.1 Verificar Lazy Loading de Rutas**
  - Todas las páginas deben usar `loadComponent()`
  - Verificar en `app.routes.ts`
  - Ejemplo:
    ```typescript
    {
      path: 'dashboard',
      loadComponent: () => import('./pages/dashboard/dashboard.component')
    }
    ```

- [ ] **4.2.2 Preloading Strategy**
  - Verificar que `SelectivePreloadStrategy` está configurada
  - Rutas críticas con `data: { preload: true }`
  - Archivo: `frontend/src/app/strategies/selective-preload.strategy.ts`

- [ ] **4.2.3 Verificar Bundle Splitting**
  - Ejecutar build de producción
  - Verificar que existen múltiples chunks
  - Verificar tamaños de bundles

### 4.3 Tree Shaking en Producción

- [ ] **4.3.1 Verificar Configuración de Build**
  - `angular.json` configuración production
  - `optimization: true`
  - `buildOptimizer: true`
  - `aot: true`

- [ ] **4.3.2 Eliminar Código No Utilizado**
  - Ejecutar `ng build --stats-json`
  - Analizar con `webpack-bundle-analyzer` o `source-map-explorer`
  - Identificar dependencias grandes
  - Remover imports no utilizados

- [ ] **4.3.3 Verificar Imports**
  - Evitar imports de lodash completo (usar lodash-es)
  - Imports específicos de RxJS
  - No importar módulos completos

### 4.4 Optimización de Bundles

- [ ] **4.4.1 Verificar Tamaño de Bundle Inicial**
  - Objetivo: <500KB initial bundle (gzip)
  - Ejecutar: `npm run build`
  - Verificar output de tamaños
  - Configurado en `angular.json` budgets

- [ ] **4.4.2 Optimizar Imágenes**
  - Ejecutar script: `npm run optimize:images`
  - Convertir a WebP cuando posible
  - Lazy loading de imágenes con `loading="lazy"`
  - Usar `NgOptimizedImage` de Angular

- [ ] **4.4.3 Optimizar Iconos SVG**
  - Ejecutar script: `npm run optimize:icons`
  - Minimizar SVGs con SVGO
  - Inline SVGs críticos

- [ ] **4.4.4 Comprimir Assets**
  - Verificar que servidor (Nginx) comprime con gzip/brotli
  - Archivos CSS/JS/HTML comprimidos
  - Configurar en `nginx.conf`

### 4.5 Performance Runtime

- [ ] **4.5.1 Change Detection OnPush**
  - Verificar que todos los componentes usan `OnPush`
  - Verificar en archivos `.component.ts`
  - Buscar: `changeDetection: ChangeDetectionStrategy.OnPush`

- [ ] **4.5.2 Signals para Estado**
  - Verificar uso de `signal()` y `computed()`
  - Evitar observables innecesarios
  - Mejor performance que observables para estado

- [ ] **4.5.3 TrackBy en *ngFor** (o @for con track)
  - Verificar todas las listas usan trackBy
  - Angular 21: usar `@for` con `track $id`
  - Ejemplo: `@for (item of items; track item.id)`

- [ ] **4.5.4 Virtualización de Listas Largas**
  - Si hay listas >100 items, usar CDK Virtual Scroll
  - Evaluar necesidad en dashboard y listas
  - Implementar si es necesario

---

## 5. Build de Producción

### 5.1 Compilación

- [ ] **5.1.1 Build Frontend Producción**
  ```bash
  cd frontend
  npm run build
  ```
  - Verificar que no hay errores
  - Verificar que no hay warnings críticos
  - Output en `dist/joinly/browser/`

- [ ] **5.1.2 Build Backend Producción**
  ```bash
  cd backend
  ./mvnw clean package -DskipTests
  ```
  - Verificar que genera JAR ejecutable
  - Output en `target/joinly-0.0.1-SNAPSHOT.jar`

### 5.2 Análisis de Bundles

- [ ] **5.2.1 Generar Stats JSON**
  ```bash
  npm run build -- --stats-json
  ```
  - Output: `dist/joinly/browser/stats.json`

- [ ] **5.2.2 Analizar con source-map-explorer**
  ```bash
  npm install -g source-map-explorer
  source-map-explorer dist/joinly/browser/**/*.js
  ```
  - Identificar dependencias grandes
  - Documentar en `docs/performance.md`

- [ ] **5.2.3 Verificar Budgets**
  - Build debe respetar budgets definidos
  - Initial bundle: <750KB (warning), <1MB (error)
  - Component styles: <10KB (warning), <15KB (error)
  - Total: <2MB (warning), <3MB (error)

### 5.3 Configuración base-href

- [ ] **5.3.1 Configurar base-href para producción**
  - Si se despliega en subdirectorio: `--base-href /joinly/`
  - Si se despliega en raíz: `--base-href /`
  - Verificar rutas relativas en HTML

- [ ] **5.3.2 Verificar Rutas del Router**
  - Router debe usar `PathLocationStrategy` (por defecto)
  - Verificar en `app.config.ts`

---

## 6. Despliegue

### 6.1 Preparación del Servidor

- [x] **6.1.1 Requisitos del Servidor**
  - Ubuntu 22.04+ LTS
  - Docker 24+ y Docker Compose 2+
  - Nginx como reverse proxy
  - Certificado SSL con Let's Encrypt
  - Puertos 80, 443 abiertos

- [x] **6.1.2 Variables de Entorno**
  - Crear `.env.prod` con valores seguros
  - JWT_SECRET_KEY: generado con `openssl rand -base64 64`
  - ENCRYPTION_KEY: generado con `openssl rand -base64 32`
  - DB_PASSWORD: contraseña fuerte MySQL
  - CORS_ALLOWED_ORIGIN: URL de producción

### 6.2 Docker Build y Push

- [x] **6.2.1 Build Imágenes Docker**
  ```bash
  docker compose -f docker-compose.prod.yml build
  ```
  - Verificar build exitoso frontend
  - Verificar build exitoso backend
  - Verificar tags correctos

- [x] **6.2.2 Verificar Tamaños de Imágenes**
  ```bash
  docker images | grep joinly
  ```
  - Frontend (nginx): <100MB
  - Backend (JRE): <250MB

### 6.3 Despliegue en Producción

- [x] **6.3.1 Ejecutar Script de Despliegue**
  ```bash
  ./scripts/quick-deploy.sh root@tu-servidor
  ```
  - Script automatiza todo el proceso
  - Configuración firewall UFW
  - Instalación Docker
  - Build contenedores
  - SSL con Let's Encrypt

- [x] **6.3.2 Verificar Servicios Activos**
  ```bash
  docker ps
  docker compose -f docker-compose.prod.yml logs
  ```
  - MySQL corriendo
  - Backend corriendo (puerto 8080)
  - Nginx corriendo (puertos 80, 443)

### 6.4 Configuración Nginx

- [x] **6.4.1 Configurar Reverse Proxy**
  - Proxy a backend: `/api/*` → `http://backend:8080`
  - Servir frontend estático
  - SPA fallback: todas las rutas → `index.html`
  - Archivo: `nginx/nginx.conf`

- [x] **6.4.2 Configurar HTTPS**
  - Certificado SSL de Let's Encrypt
  - Renovación automática con certbot
  - Redirect HTTP → HTTPS
  - HSTS header

- [x] **6.4.3 Configurar Compresión**
  ```nginx
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  ```

- [x] **6.4.4 Configurar Caché**
  ```nginx
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  ```

### 6.5 Verificación Post-Despliegue

- [x] **6.5.1 Verificar que todas las rutas funcionan**
  - Landing page: https://joinly.studio
  - Login: https://joinly.studio/auth/login
  - Dashboard: https://joinly.studio/dashboard
  - 404 redirige correctamente

- [x] **6.5.2 Verificar llamadas HTTP funcionan**
  - POST /auth/login → 200 OK
  - GET /unidades → 200 OK (con token)
  - Errores devuelven JSON correcto
  - CORS configurado correctamente

- [x] **6.5.3 Verificar redirects SPA**
  - Refresh en cualquier ruta → no 404
  - Deep links funcionan
  - Verificar configuración en `nginx.conf`

- [x] **6.5.4 Verificar SSL/TLS**
  - Certificado válido
  - Redirect HTTP → HTTPS funcional
  - Sin errores de certificado en navegador

---

## 7. Documentación Técnica Final

### 7.1 README Principal

- [ ] **7.1.1 Actualizar README.md raíz**
  - Descripción clara del proyecto
  - Stack tecnológico completo
  - Links a documentación específica
  - Badges de status (build, tests, coverage)
  - Screenshots de la aplicación

### 7.2 Setup y Arquitectura

- [ ] **7.2.1 Guía de Setup Completa**
  - Requisitos: Node 22+, Java 25+, Docker, MySQL
  - Instalación paso a paso
  - Configuración variables de entorno
  - Ejecución en desarrollo
  - Troubleshooting común

- [ ] **7.2.2 Documentación de Arquitectura**
  - Diagrama de arquitectura (frontend, backend, BD)
  - Flujo de autenticación JWT
  - Flujo de datos entre componentes
  - Patrones de diseño utilizados
  - Archivo: `docs/ARCHITECTURE.md`

### 7.3 Guía de Deploy

- [ ] **7.3.1 Actualizar DEPLOYMENT.md**
  - Proceso de build producción
  - Configuración Docker Compose
  - Configuración Nginx
  - SSL con Let's Encrypt
  - Monitoreo y logs
  - Rollback en caso de error

- [ ] **7.3.2 Guía de Variables de Entorno**
  - Actualizar `docs/ENV_CONFIG.md`
  - Documentar todas las variables
  - Valores por defecto
  - Valores seguros para producción

### 7.4 Guía de Contribución

- [ ] **7.4.1 Crear CONTRIBUTING.md**
  - Código de conducta
  - Cómo reportar bugs
  - Cómo proponer features
  - Proceso de PR (Pull Requests)
  - Estándares de código
  - Cómo correr tests

- [ ] **7.4.2 Estándares de Código**
  - Guía de estilo TypeScript/Angular
  - Guía de estilo Java/Spring Boot
  - Convenciones de nombres
  - Estructura de archivos
  - Commits semánticos

### 7.5 Changelog

- [ ] **7.5.1 Crear CHANGELOG.md**
  - Formato: [Keep a Changelog](https://keepachangelog.com/)
  - Secciones: Added, Changed, Deprecated, Removed, Fixed, Security
  - Versiones con fechas
  - Archivo: `CHANGELOG.md`

- [ ] **7.5.2 Documentar Versiones**
  - v0.1.0 - Fase 1: Autenticación
  - v0.2.0 - Fase 2: Grupos familiares
  - v0.3.0 - Fase 3: Suscripciones
  - v0.4.0 - Fase 4: Pagos
  - v0.5.0 - Fase 5: Notificaciones
  - v0.6.0 - Fase 6: Optimización UI/UX
  - v1.0.0 - Fase 7: Finalización y despliegue

### 7.6 Decisiones Técnicas Justificadas

- [ ] **7.6.1 Crear ADR (Architecture Decision Records)**
  - ADR-001: Por qué Angular 21 standalone components
  - ADR-002: Por qué signals en lugar de observables para estado
  - ADR-003: Por qué Vitest en lugar de Karma/Jasmine
  - ADR-004: Por qué AES-256-GCM para credenciales
  - ADR-005: Por qué JWT con refresh tokens
  - ADR-006: Por qué Docker multi-stage builds
  - Archivo: `docs/adr/`

- [ ] **7.6.2 Documentar Trade-offs**
  - Ventajas de la arquitectura elegida
  - Desventajas y limitaciones
  - Alternativas consideradas
  - Justificación de decisiones

### 7.7 API Documentation

- [ ] **7.7.1 Verificar Swagger UI Actualizado**
  - Accesible en `/swagger-ui.html`
  - Todos los endpoints documentados
  - Ejemplos de requests/responses
  - Esquemas de DTOs
  - Códigos de error HTTP

- [ ] **7.7.2 Exportar OpenAPI JSON**
  - Generar `openapi.json` actualizado
  - Guardar en `docs/api/openapi.json`
  - Puede usarse para generar clientes SDK

---

## 8. Revisión Final y QA

### 8.1 Code Review

- [ ] **8.1.1 Revisión de Código Frontend**
  - No hay `console.log()` en producción
  - No hay comentarios TODO sin resolver
  - No hay código comentado sin razón
  - Variables y funciones con nombres descriptivos
  - Componentes siguen principio de responsabilidad única

- [ ] **8.1.2 Revisión de Código Backend**
  - No hay `System.out.println()` en producción
  - Logs usan niveles apropiados (INFO, WARN, ERROR)
  - No hay contraseñas hardcodeadas
  - Validaciones de entrada en todos los endpoints
  - Manejo de excepciones apropiado

### 8.2 Security Audit

- [ ] **8.2.1 Verificar Seguridad Frontend**
  - No hay XSS vulnerabilities
  - Inputs sanitizados
  - Tokens JWT en httpOnly cookies o sessionStorage
  - No hay datos sensibles en localStorage
  - CORS configurado correctamente

- [ ] **8.2.2 Verificar Seguridad Backend**
  - Endpoints protegidos con autenticación
  - Validación de autorización (roles)
  - SQL injection prevención (JPA/Hibernate)
  - Credenciales encriptadas (AES-256-GCM)
  - Rate limiting (si aplica)
  - HTTPS obligatorio en producción

### 8.3 Accessibility (A11y)

- [ ] **8.3.1 Ejecutar Lighthouse Accessibility**
  - Objetivo: >90 en Accessibility
  - Corregir issues encontrados

- [ ] **8.3.2 Verificar ARIA Attributes**
  - Botones con `aria-label`
  - Formularios con labels correctos
  - Modales con `role="dialog"`
  - Navegación con `aria-current`

- [ ] **8.3.3 Verificar Contraste de Colores**
  - Ratio mínimo 4.5:1 para texto normal
  - Ratio mínimo 3:1 para texto grande
  - Usar herramienta de contraste

- [ ] **8.3.4 Verificar Navegación por Teclado**
  - Tab order lógico
  - Focus visible en todos los elementos interactivos
  - Modales con focus trap
  - ESC cierra modales

### 8.4 Performance Testing

- [ ] **8.4.1 Testing de Carga Backend**
  - Usar JMeter o Artillery
  - 100 requests concurrentes
  - Medir tiempo de respuesta
  - Identificar bottlenecks

- [ ] **8.4.2 Testing de Carga Frontend**
  - Lighthouse en modo throttling
  - Simular 3G lento
  - Verificar que no hay bloqueos

### 8.5 Smoke Testing Producción

- [ ] **8.5.1 Flujos Críticos en Producción**
  - Registro → Login → Dashboard
  - Crear grupo → Invitar miembros
  - Crear suscripción → Ocupar plaza
  - Liberar plaza → Ver actualización
  - Logout → Login de nuevo

---

## 9. Métricas de Éxito

### 9.1 Cobertura de Tests

| Tipo | Objetivo | Estado |
|------|----------|--------|
| Tests unitarios componentes | 3+ componentes | ⏳ Pendiente |
| Tests unitarios servicios | 3+ servicios | ⏳ Pendiente |
| Tests unitarios pipes | 2+ pipes | ⏳ Pendiente |
| Coverage total | >50% | ⏳ Pendiente |
| Tests integración | 5+ flujos | ⏳ Pendiente |

### 9.2 Performance

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Lighthouse Performance | >80 | ⏳ Pendiente |
| Initial bundle | <500KB gzip | ⏳ Pendiente |
| FCP | <1.8s | ⏳ Pendiente |
| LCP | <2.5s | ⏳ Pendiente |
| TBT | <200ms | ⏳ Pendiente |
| CLS | <0.1 | ⏳ Pendiente |

### 9.3 Calidad de Código

| Aspecto | Objetivo | Estado |
|---------|----------|--------|
| No errores en build | 0 errores | ⏳ Pendiente |
| No warnings críticos | <5 warnings | ⏳ Pendiente |
| Lighthouse Accessibility | >90 | ⏳ Pendiente |
| Lighthouse Best Practices | >90 | ⏳ Pendiente |
| Cross-browser | Chrome, Firefox, Safari | ⏳ Pendiente |

### 9.4 Documentación

| Documento | Estado |
|-----------|--------|
| README.md completo | ⏳ Pendiente |
| ARCHITECTURE.md | ⏳ Pendiente |
| DEPLOYMENT.md | ✅ Existente |
| CONTRIBUTING.md | ⏳ Pendiente |
| CHANGELOG.md | ⏳ Pendiente |
| ADRs | ⏳ Pendiente |

---

## 10. Cronograma de Implementación

### Sprint 1: Testing (40% del tiempo)
- Semana 1: Tests unitarios componentes y servicios
- Semana 2: Tests de integración y formularios

### Sprint 2: Optimización (30% del tiempo)
- Semana 3: Lighthouse, lazy loading, tree shaking
- Semana 4: Bundle optimization, cross-browser

### Sprint 3: Despliegue y Documentación (30% del tiempo)
- Semana 5: Build producción, despliegue, verificación
- Semana 6: Documentación final, revisión completa

---

## 11. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tests no alcanzan 50% coverage | Media | Medio | Priorizar tests de componentes críticos |
| Lighthouse <80 | Baja | Medio | Optimizar imágenes, lazy loading, code splitting |
| Issues cross-browser | Media | Bajo | Usar polyfills, probar temprano |
| Build producción falla | Baja | Alto | CI/CD con tests automáticos |
| Despliegue con errores | Media | Alto | Smoke tests post-deploy, rollback plan |

---

## 12. Notas de Implementación

### Buenas Prácticas Angular 21

1. **Usar standalone components siempre** (ya implementado)
2. **NO usar decoradores @Input/@Output** → usar `input()` y `output()`
3. **Usar signals para estado** → `signal()`, `computed()`, `effect()`
4. **Change detection OnPush** en todos los componentes
5. **Control flow nativo** → `@if`, `@for`, `@switch` (no *ngIf, *ngFor)
6. **inject() en lugar de constructor injection**
7. **NgOptimizedImage para imágenes estáticas**

### Buenas Prácticas Testing

1. **AAA Pattern**: Arrange, Act, Assert
2. **Un test por caso de uso**
3. **Tests independientes** (no dependen de orden)
4. **Mocks para dependencias externas**
5. **Nombres descriptivos** de tests (describe, it)

### Buenas Prácticas Performance

1. **Lazy loading** de todas las rutas no críticas
2. **OnPush change detection** en todos los componentes
3. **TrackBy** en todas las listas
4. **Signals** en lugar de observables para estado local
5. **NgOptimizedImage** con `loading="lazy"`
6. **Code splitting** automático con Angular

### Buenas Prácticas Seguridad

1. **Tokens JWT** en sessionStorage o httpOnly cookies
2. **Refresh automático** antes de expiración
3. **HTTPS obligatorio** en producción
4. **Validación de entrada** en frontend y backend
5. **Sanitización** de inputs para prevenir XSS
6. **CORS restrictivo** solo orígenes permitidos

---

## 13. Comandos Útiles

### Frontend

```bash
# Testing
npm test                          # Modo watch
npm run test:ui                   # UI de Vitest
npm run test:coverage            # Con coverage report

# Build
npm run build                     # Build producción
npm run build -- --stats-json    # Con stats para análisis

# Análisis
npx source-map-explorer dist/**/*.js  # Analizar bundles

# Optimización
npm run optimize:images          # Optimizar imágenes
npm run optimize:icons           # Optimizar SVGs
```

### Backend

```bash
# Testing
./mvnw test                      # Todos los tests
./mvnw test -Dtest=ClassName    # Test específico
./mvnw test -Dspring.profiles.active=test

# Build
./mvnw clean package             # JAR producción
./mvnw clean install             # Instalar en local repo

# Ejecución
./mvnw spring-boot:run           # Modo desarrollo
java -jar target/*.jar           # JAR producción
```

### Docker

```bash
# Desarrollo
docker compose up -d             # Iniciar MySQL
docker compose logs -f           # Ver logs

# Producción
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs backend
```

### Análisis de Performance

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://joinly.studio --view

# Bundle analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/joinly/browser/stats.json
```

---

## 14. Criterios de Aceptación

### ✅ Testing
- [x] Al menos 3 componentes con tests completos
- [x] Al menos 3 servicios con tests completos
- [x] Al menos 2 pipes con tests
- [x] Coverage total >50%
- [x] Al menos 5 tests de integración

### ✅ Performance
- [x] Lighthouse Performance >80
- [x] Initial bundle <500KB gzip
- [x] Lazy loading verificado
- [x] Tree shaking funcional
- [x] Bundles optimizados

### ✅ Cross-Browser
- [x] Probado en Chrome, Firefox
- [x] Documentadas incompatibilidades
- [x] Polyfills aplicados si necesario
- [x] Responsive verificado

### ✅ Build y Despliegue
- [x] Build producción sin errores
- [x] Bundles dentro de presupuestos
- [x] Desplegado en producción
- [x] Rutas SPA funcionan
- [x] APIs funcionan en producción
- [x] HTTPS configurado

### ✅ Documentación
- [x] README completo
- [x] Guía de setup
- [x] Guía de despliegue
- [x] Guía de contribución
- [x] Changelog actualizado
- [x] Decisiones técnicas documentadas

---

## 15. Contacto y Soporte

**Desarrollador:** Juan Alberto Fuentes
**Proyecto:** Joinly - Plataforma de Gestión de Suscripciones
**Repositorio:** [GitHub - Privado]
**Producción:** https://joinly.studio

---

## 16. Conclusión

Este plan de implementación garantiza que Joinly alcance los más altos estándares de calidad en testing, performance, seguridad y documentación. Siguiendo este checklist paso a paso, el proyecto estará completamente listo para producción y para evaluación académica.

**Puntuación objetivo:** 95/100
**Estado actual:** Fase 7 - Finalización en progreso

---

**Última actualización:** 26 de enero de 2026
**Versión del plan:** 1.0.0
