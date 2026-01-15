# Joinly Frontend

Aplicación web progresiva para gestión de suscripciones compartidas en grupos familiares.

## Tecnologías

- **Angular 21** - Framework principal
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **Signals** - Sistema de reactividad nativo de Angular
- **SCSS** - Estilos con preprocesador CSS

## Características

- Autenticación JWT con refresh token automático
- Dashboard de grupos familiares
- Gestión de suscripciones compartidas
- Sistema de invitaciones con código
- Notificaciones en tiempo real (toasts)
- Spinner de carga global
- Manejo robusto de errores HTTP
- Arquitectura modular y escalable

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Módulo core (ApiService, configuración)
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas/vistas
│   │   ├── services/          # Servicios de negocio
│   │   ├── interceptors/      # Interceptores HTTP
│   │   ├── guards/            # Guards de rutas
│   │   ├── models/            # Interfaces TypeScript
│   │   ├── validators/        # Validadores de formularios
│   │   └── resolvers/         # Resolvers de datos
│   └── styles/                # Estilos globales
└── ...
```

## 📚 Documentación

La documentación técnica completa está centralizada en `docs/frontend/`:

| Documento | Descripción |
|-----------|-------------|
| [docs/frontend/README.md](../docs/frontend/README.md) | Índice completo de documentación |
| [docs/frontend/HTTP_API.md](../docs/frontend/HTTP_API.md) | API REST y comunicación HTTP |
| [docs/frontend/NAVIGATION.md](../docs/frontend/NAVIGATION.md) | Sistema de rutas y navegación |
| [docs/frontend/LAZY_LOADING.md](../docs/frontend/LAZY_LOADING.md) | Lazy loading y performance |

## Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start

# Build de producción
npm run build

# Tests
npm test

# Linting
npm run lint
```

## Documentación

### HTTP y API REST

La aplicación consume una API REST documentada en detalle:

- **[HTTP_API.md](./docs/HTTP_API.md)** - Documentación completa de integración HTTP
  - Configuración de HttpClient
  - Catálogo de 13 endpoints REST
  - Interfaces TypeScript
  - Manejo de errores en 3 capas
  - Estados de carga
  - Buenas prácticas

- **[HTTP_IMPLEMENTATION_SUMMARY.md](./docs/HTTP_IMPLEMENTATION_SUMMARY.md)** - Resumen ejecutivo
  - Estado de implementación
  - Tareas completadas
  - Archivos modificados
  - Estadísticas del proyecto

### Arquitectura HTTP

#### Servicios

- **ApiService** - Servicio base para todas las operaciones HTTP
- **AuthService** - Autenticación y gestión de usuarios
- **UnidadFamiliarService** - Gestión de grupos familiares
- **SuscripcionService** - Gestión de suscripciones
- **SolicitudService** - Solicitudes de unión a grupos

#### Interceptores

1. **authInterceptor** - Añade token JWT + refresh automático
2. **loadingInterceptor** - Spinner global automático
3. **errorInterceptor** - Manejo global de errores + toasts

#### Modelos

Todas las interfaces TypeScript están en `src/app/models/`:

- `auth.model.ts` - Autenticación
- `grupo.model.ts` - Grupos familiares
- `suscripcion.model.ts` - Suscripciones
- `solicitud.model.ts` - Solicitudes
- `resource-state.model.ts` - Estados de recursos HTTP

## Configuración

### Variables de Entorno

La URL base de la API se configura en `src/app/core/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: '/api/v1',
  timeout: 30000,
};
```

### Proxy de Desarrollo

El archivo `proxy.conf.json` redirige las peticiones al backend:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Endpoints REST

La aplicación consume 13 endpoints documentados:

### Autenticación
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/refresh` - Refresh token
- `GET /auth/validate` - Validar token
- `GET /auth/check-email` - Verificar email

### Grupos
- `GET /unidades/:id` - Detalle de grupo
- `GET /unidades/:id/miembros` - Miembros
- `GET /unidades/administradas` - Grupos administrados
- `GET /unidades/miembro/cards` - Dashboard cards
- `GET /unidades/codigo/:codigo` - Validar código
- `POST /unidades` - Crear grupo

### Suscripciones
- `GET /suscripciones/unidad/:id` - Listar suscripciones
- `POST /suscripciones` - Crear suscripción

### Solicitudes
- `POST /solicitudes/grupo` - Unirse a grupo

Ver [HTTP_API.md](./docs/HTTP_API.md) para detalles completos.

## Manejo de Errores

Sistema de 3 capas:

1. **Interceptor Global** - Captura todos los errores HTTP y muestra toasts
2. **Servicios** - Transformaciones específicas de negocio
3. **Componentes** - Estados visuales (loading, error, empty)

Códigos HTTP mapeados a mensajes amigables:
- `0` → Sin conexión al servidor
- `401` → Sesión expirada
- `403` → Sin permisos
- `404` → Recurso no encontrado
- `5xx` → Error del servidor

## Estados de Carga

### Global

`LoadingService` + `loadingInterceptor` gestionan automáticamente el spinner global.

### Local

Usar el tipo `ResourceState<T>`:

```typescript
import { ResourceState, initialResourceState, loadingResourceState,
         errorResourceState, successResourceState } from '@models';

state = signal(initialResourceState<Product[]>());

loadData() {
  this.state.set(loadingResourceState());
  this.service.getData().subscribe({
    next: (data) => this.state.set(successResourceState(data)),
    error: (err) => this.state.set(errorResourceState(err.message))
  });
}
```

## Buenas Prácticas Implementadas

### Angular 21

- ✅ Standalone components (sin NgModules)
- ✅ Signals para estado reactivo
- ✅ `inject()` en lugar de constructor injection
- ✅ Control flow nativo (`@if`, `@for`, `@switch`)
- ✅ `provideHttpClient()` con interceptores funcionales
- ✅ `input()` y `output()` functions
- ✅ `changeDetection: OnPush` en todos los componentes

### TypeScript

- ✅ Strict mode activo
- ✅ Sin tipos `any`
- ✅ Interfaces para todas las respuestas HTTP
- ✅ Tipado genérico en servicios

### HTTP

- ✅ Servicio base centralizado (`ApiService`)
- ✅ Interceptores funcionales (no clases)
- ✅ Retry logic configurable
- ✅ Manejo de errores robusto
- ✅ Loading states automáticos

### Arquitectura

- ✅ Separación de responsabilidades
- ✅ Servicios de dominio reutilizables
- ✅ Componentes pequeños y enfocados
- ✅ Configuración centralizada
- ✅ Documentación inline (JSDoc)

## Scripts Disponibles

```bash
# Desarrollo con hot reload
npm start

# Build de producción
npm run build

# Build + análisis de bundle
npm run build:analyze

# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Linting
npm run lint

# Formateo de código
npm run format

# Pre-commit checks
npm run pre-commit
```

## Despliegue

El proyecto se puede desplegar en cualquier servidor web estático (Nginx, Apache, Vercel, Netlify):

```bash
# Build de producción
npm run build

# Los archivos están en dist/joinly
# Subir el contenido a tu servidor
```

## Compatibilidad de Navegadores

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Licencia

Proyecto privado - Joinly 2026

## Contacto

Para dudas o soporte, consultar la documentación en `docs/` o contactar al equipo de desarrollo.

---

**Versión:** 1.0.0
**Framework:** Angular 21
**Node:** 18+
**NPM:** 9+
