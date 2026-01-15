# Documentación del Frontend - Joinly

Documentación técnica completa de la aplicación frontend de Joinly construida con Angular 21.

---

## 📚 Índice de documentación

### Comunicación HTTP y API REST

La comunicación con el backend se realiza mediante HttpClient con interceptores funcionales, servicios de dominio y tipado completo.

| Documento                                                       | Descripción                                           | Líneas | Estado |
| --------------------------------------------------------------- | ----------------------------------------------------- | ------ | ------ |
| [HTTP_API.md](./HTTP_API.md)                                    | Documentación completa de integración HTTP            | 660    | ✅     |
| [HTTP_IMPLEMENTATION_SUMMARY.md](./HTTP_IMPLEMENTATION_SUMMARY.md) | Resumen de implementación y checklist de tareas     | 343    | ✅     |

### Sistema de Navegación y Rutas

El sistema de navegación SPA implementado con Angular Router incluye lazy loading, guards, resolvers y breadcrumbs dinámicos.

| Documento                                             | Descripción                                      | Líneas | Estado |
| ----------------------------------------------------- | ------------------------------------------------ | ------ | ------ |
| [NAVIGATION.md](./NAVIGATION.md)                      | Documentación completa del sistema de navegación | 1035   | ✅     |
| [NAVIGATION_EXAMPLES.md](./NAVIGATION_EXAMPLES.md)    | Ejemplos prácticos de navegación programática   | 700+   | ✅     |
| [LAZY_LOADING.md](./LAZY_LOADING.md)                  | Análisis de chunks y estrategia de precarga      | 800+   | ✅     |
| [NAVIGATION_QUICKSTART.md](./NAVIGATION_QUICKSTART.md)| Guía rápida de referencia                        | 400+   | ✅     |
| [NAVIGATION_SUMMARY.md](./NAVIGATION_SUMMARY.md)      | Resumen de entregables completados               | 500+   | ✅     |

---

## 🚀 Quick Start

### Guía rápida de HTTP/API

Para consumir endpoints o añadir nuevos servicios:

👉 **[HTTP_API.md](./HTTP_API.md)** - Endpoints, interfaces y manejo de errores

### Guía rápida de navegación

Si necesitas agregar una nueva ruta o navegar programáticamente, consulta:

👉 **[NAVIGATION_QUICKSTART.md](./NAVIGATION_QUICKSTART.md)** - Patrones comunes y ejemplos rápidos

### Documentación completa

Para entender todo el sistema de rutas, guards, resolvers y lazy loading:

👉 **[NAVIGATION.md](./NAVIGATION.md)** - Documentación técnica completa

### Ejemplos reales del proyecto

Para ver cómo se implementa la navegación en Joinly:

👉 **[NAVIGATION_EXAMPLES.md](./NAVIGATION_EXAMPLES.md)** - Casos de uso reales

---

## 📖 Contenido por Fase

### Fase 4: Enrutamiento y Navegación SPA

| Tarea | Documentación | Contenido principal |
|-------|---------------|---------------------|
| 1. Configuración de rutas | [NAVIGATION.md#tarea-1](./NAVIGATION.md#tarea-1-configuración-de-rutas) | 16 rutas, parámetros, rutas hijas |
| 2. Navegación programática | [NAVIGATION_EXAMPLES.md](./NAVIGATION_EXAMPLES.md) | Router.navigate(), query params |
| 3. Lazy Loading | [LAZY_LOADING.md](./LAZY_LOADING.md) | 23+ chunks, precarga selectiva |
| 4. Route Guards | [NAVIGATION.md#tarea-4](./NAVIGATION.md#tarea-4-route-guards) | authGuard, pendingChangesGuard |
| 5. Resolvers | [NAVIGATION.md#tarea-5](./NAVIGATION.md#tarea-5-resolvers) | dashboardResolver, grupoDetalleResolver |
| 6. Breadcrumbs | [NAVIGATION.md#tarea-6](./NAVIGATION.md#tarea-6-breadcrumbs-dinámicos) | BreadcrumbService, breadcrumbs dinámicos |
| 7. Documentación | Este directorio | 5 documentos, 3000+ líneas |

### Fase 5: Servicios y Comunicación HTTP

| Tarea | Documentación | Contenido principal |
|-------|---------------|---------------------|
| 1. Configuración HttpClient | [HTTP_API.md#configuración-http](./HTTP_API.md#configuración-http) | provideHttpClient, ApiService |
| 2. Operaciones CRUD | [HTTP_API.md#catálogo-de-endpoints](./HTTP_API.md#catálogo-de-endpoints) | 13 endpoints REST |
| 3. Manejo de respuestas | [HTTP_API.md#manejo-de-errores](./HTTP_API.md#manejo-de-errores) | Tipado, map, catchError, retry |
| 4. Formatos diferentes | [HTTP_API.md#buenas-prácticas](./HTTP_API.md#buenas-prácticas) | JSON, FormData, query params |
| 5. Estados de carga | [HTTP_API.md#estados-de-carga](./HTTP_API.md#estados-de-carga) | LoadingService, ResourceState |
| 6. Interceptores HTTP | [HTTP_IMPLEMENTATION_SUMMARY.md](./HTTP_IMPLEMENTATION_SUMMARY.md) | 4 interceptores funcionales |
| 7. Documentación API | [HTTP_API.md](./HTTP_API.md) | Catálogo completo de endpoints |

---

## 📊 Estadísticas del proyecto

### Rutas implementadas

- **Total de rutas**: 16
- **Rutas protegidas**: 9 (con `authGuard`)
- **Rutas con formulario**: 2 (con `pendingChangesGuard`)
- **Rutas con resolver**: 2 (dashboard, grupo-detalle)
- **Rutas con lazy loading**: 16 (100%)

### Performance

- **Bundle inicial** (gzip): 145 kB
- **Lazy chunks**: 23+ archivos
- **Reducción con gzip**: 76% (611 kB → 145 kB)
- **Tiempo de build**: 4.6 segundos
- **Lighthouse score**: ~92/100

### Documentación

- **Archivos de documentación**: 5
- **Líneas totales**: 3000+
- **Ejemplos de código**: 50+
- **Diagramas**: 3

---

## 🛠️ Arquitectura técnica

### Stack tecnológico

- **Framework**: Angular 21
- **Arquitectura**: Standalone Components
- **Router**: Angular Router con lazy loading
- **State**: Signals (Angular 21+)
- **Estilos**: SCSS con arquitectura BEM
- **Build**: Angular CLI con esbuild

### Archivos principales

```
frontend/src/app/
├── app.routes.ts              # Configuración central de rutas
├── app.config.ts              # Configuración del router
├── guards/                    # Guards de protección
│   ├── auth.guard.ts
│   ├── pending-changes.guard.ts
│   └── can-component-deactivate.ts
├── resolvers/                 # Resolvers de precarga
│   ├── dashboard.resolver.ts
│   ├── grupo-detalle.resolver.ts
│   └── types.ts
├── strategies/                # Estrategias de precarga
│   └── selective-preload.strategy.ts
├── services/                  # Servicios
│   └── breadcrumb.service.ts
├── components/                # Componentes compartidos
│   └── shared/
│       ├── breadcrumbs/
│       └── not-found/
└── pages/                     # Páginas de la aplicación
    ├── home/
    ├── dashboard/
    ├── grupo-detalle/
    ├── crear-grupo/
    ├── usuario/
    └── ...
```

---

## 🎯 Características destacadas

### Angular 21 Best Practices

✅ Standalone components (sin NgModule)  
✅ Functional guards (`CanActivateFn`, `CanDeactivateFn`)  
✅ Functional resolvers (`ResolveFn`)  
✅ Router Inputs (`withComponentInputBinding`)  
✅ View Transitions (`withViewTransitions`)  
✅ Signals para reactividad  

### Performance

✅ 100% lazy loading  
✅ Precarga selectiva inteligente  
✅ Code splitting automático  
✅ Tree shaking habilitado  
✅ Gzip compression (76% reducción)  
✅ Chunks optimizados por feature  

### UX / Accesibilidad

✅ Breadcrumbs dinámicos semánticos  
✅ Página 404 profesional  
✅ Loading states con spinner global  
✅ Navegación instantánea (rutas precargadas)  
✅ Mensajes de error claros  
✅ Prevención de pérdida de datos en formularios  

### Developer Experience

✅ Documentación completa (5 archivos, 3000+ líneas)  
✅ Ejemplos reales de navegación  
✅ Análisis de chunks detallado  
✅ Type safety en todos los resolvers  
✅ Guards reutilizables  
✅ Guías rápidas de referencia  

---

## 📖 Cómo usar esta documentación

### Si necesitas...

**...agregar una nueva ruta**

1. Lee [NAVIGATION_QUICKSTART.md](./NAVIGATION_QUICKSTART.md#crear-una-nueva-ruta)
2. Sigue el checklist de nuevas rutas
3. Verifica la navegación

**...proteger una ruta**

1. Lee [NAVIGATION_QUICKSTART.md](./NAVIGATION_QUICKSTART.md#proteger-una-ruta)
2. Usa `authGuard` o crea un nuevo guard
3. Documenta en `app.routes.ts`

**...navegar programáticamente**

1. Lee [NAVIGATION_EXAMPLES.md](./NAVIGATION_EXAMPLES.md)
2. Busca un ejemplo similar a tu caso
3. Adapta el código

**...precargar datos antes de mostrar una ruta**

1. Lee [NAVIGATION.md - Tarea 5](./NAVIGATION.md#tarea-5-resolvers)
2. Crea un resolver siguiendo los ejemplos
3. Agrégalo en `app.routes.ts`

**...entender cómo funciona el lazy loading**

1. Lee [LAZY_LOADING.md](./LAZY_LOADING.md)
2. Verifica los chunks con `npm run build`
3. Usa DevTools para ver la precarga

**...entender todo el sistema**

1. Empieza por [NAVIGATION_SUMMARY.md](./NAVIGATION_SUMMARY.md)
2. Luego lee [NAVIGATION.md](./NAVIGATION.md) completo
3. Consulta [NAVIGATION_EXAMPLES.md](./NAVIGATION_EXAMPLES.md) para casos específicos

---

## 🔗 Enlaces útiles

### Documentación oficial

- [Angular Router](https://angular.io/guide/router)
- [Lazy Loading](https://angular.io/guide/lazy-loading-ngmodules)
- [Route Guards](https://angular.io/guide/router-tutorial-toh#milestone-5-route-guards)
- [Route Resolvers](https://angular.io/api/router/Resolve)
- [Preloading Strategies](https://angular.io/guide/router#preloading-background-loading-of-feature-areas)

### Recursos del proyecto

- [Repositorio GitHub](https://github.com/Juanfu224/Joinly)
- [Guía de Estilos](../../frontend/src/app/pages/style-guide/)
- [Documentación de despliegue](../DEPLOYMENT.md)

---

## 🤝 Contribuir

Si encuentras errores o quieres mejorar la documentación:

1. Revisa las guías existentes
2. Mantén el formato consistente
3. Agrega ejemplos de código reales
4. Documenta decisiones de diseño
5. Actualiza el índice y enlaces

---

## 📝 Historial de cambios

### Versión 1.0 (14 de enero de 2026)

- ✅ Sistema de navegación completo implementado
- ✅ 5 documentos de navegación creados
- ✅ Lazy loading al 100% con precarga selectiva
- ✅ Guards y resolvers funcionando
- ✅ Breadcrumbs dinámicos implementados
- ✅ Build de producción optimizado (145 kB gzip)

### Versión 1.1 (15 de enero de 2026)

- ✅ Comunicación HTTP completa implementada (Fase 5)
- ✅ 4 interceptores funcionales (auth, loading, logging, error)
- ✅ 13 endpoints REST documentados
- ✅ Documentación centralizada en `docs/frontend/`

---

**Última actualización**: 15 de enero de 2026  
**Mantenedor**: Equipo de desarrollo Joinly  
**Versión de Angular**: 21.0.1
