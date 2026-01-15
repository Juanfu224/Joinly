# Documentación HTTP API - Joinly Frontend

Documentación completa de la integración HTTP del frontend Angular con el backend REST API.

## Tabla de contenidos

1. [Configuración HTTP](#configuración-http)
2. [Catálogo de Endpoints](#catálogo-de-endpoints)
3. [Estructura de Datos](#estructura-de-datos)
4. [Manejo de Errores](#manejo-de-errores)
5. [Estados de Carga](#estados-de-carga)
6. [Buenas Prácticas](#buenas-prácticas)

---

## Configuración HTTP

### Configuración base (`app.config.ts`)

```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor, loadingInterceptor, loggingInterceptor, errorInterceptor])
)
```

**Interceptores activos:**

1. **authInterceptor** - Añade token JWT automáticamente, maneja refresh token
2. **loadingInterceptor** - Muestra/oculta spinner global
3. **loggingInterceptor** - Registra requests/responses para debugging (desarrollo)
4. **errorInterceptor** - Captura errores y muestra toasts

### Servicio base (`ApiService`)

Centraliza todas las operaciones HTTP:

- **URL base:** `/api/v1` (configurada en `API_CONFIG`)
- **Métodos:** `get()`, `post()`, `put()`, `patch()`, `delete()`
- **Características:**
  - Tipado genérico TypeScript
  - Retry configurable para operaciones críticas
  - Logging estructurado de errores
  - Manejo centralizado de errores

**Uso básico:**

```typescript
@Injectable({ providedIn: 'root' })
export class MiServicio {
  private readonly api = inject(ApiService);

  getData() {
    return this.api.get<MiModelo>('endpoint');
  }

  saveData(data: CreateDto) {
    return this.api.post<MiModelo>('endpoint', data);
  }

  // Con retry automático
  getDatosCriticos() {
    return this.api.get<Data>('endpoint', {
      retry: { maxRetries: 3, delay: 1000 }
    });
  }
}
```

---

## Catálogo de Endpoints

### Autenticación

| Método | Endpoint                 | Descripción                          | Servicio                                    |
|--------|--------------------------|--------------------------------------|---------------------------------------------|
| POST   | `/auth/login`           | Login usuario (email + password)     | `AuthService.login(credentials)`            |
| POST   | `/auth/register`        | Registro de nuevo usuario            | `AuthService.register(data)`                |
| POST   | `/auth/refresh`         | Renovar access token                 | `authInterceptor` (automático)              |
| GET    | `/auth/validate`        | Validar token                        | `AuthService.validateToken(token)`          |
| GET    | `/auth/check-email`     | Verificar disponibilidad de email    | `AuthService.checkEmailAvailability(email)` |

### Unidades Familiares (Grupos)

| Método | Endpoint                        | Descripción                              | Servicio                                     |
|--------|---------------------------------|------------------------------------------|----------------------------------------------|
| GET    | `/unidades/:id`                | Obtener grupo por ID                     | `UnidadFamiliarService.getGrupoById(id)`     |
| GET    | `/unidades/:id/miembros`       | Obtener miembros de un grupo             | `UnidadFamiliarService.getMiembrosGrupo(id)` |
| GET    | `/unidades/administradas`      | Grupos administrados por el usuario      | `UnidadFamiliarService.getGruposAdministrados()` |
| GET    | `/unidades/miembro/cards`      | Tarjetas de grupos para dashboard        | `UnidadFamiliarService.getGruposCards()`     |
| GET    | `/unidades/codigo/:codigo`     | Validar código de invitación             | `UnidadFamiliarService.validarCodigo(codigo)` |
| POST   | `/unidades`                    | Crear nueva unidad familiar              | `UnidadFamiliarService.crearUnidad(data)`    |

### Suscripciones

| Método | Endpoint                           | Descripción                              | Servicio                                          |
|--------|------------------------------------|------------------------------------------|---------------------------------------------------|
| GET    | `/suscripciones/unidad/:id`       | Suscripciones de un grupo (paginado)     | `SuscripcionService.getSuscripcionesGrupo(id)`    |
| POST   | `/suscripciones`                  | Crear nueva suscripción                  | `SuscripcionService.crearSuscripcion(request)`    |

### Solicitudes

| Método | Endpoint                | Descripción                          | Servicio                                  |
|--------|-------------------------|--------------------------------------|-------------------------------------------|
| POST   | `/solicitudes/grupo`   | Solicitar unirse a un grupo          | `SolicitudService.unirseGrupo(data)`      |

---

## Estructura de Datos

### Interfaces de Autenticación

```typescript
// Request de login
interface LoginData {
  email: string;
  password: string;
}

// Request de registro
interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

// Respuesta de autenticación
interface AuthResponse {
  id: number;
  nombre: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Usuario autenticado (estado local)
interface User {
  id: number;
  nombre: string;
  email: string;
}
```

### Interfaces de Grupos

```typescript
// Unidad Familiar completa
interface UnidadFamiliar {
  id: number;
  nombre: string;
  codigoInvitacion: string;
  administrador: UsuarioSummary;
  fechaCreacion: string;
  descripcion: string | null;
  maxMiembros: number;
  estado: EstadoUnidadFamiliar;
}

// Resumen de usuario
interface UsuarioSummary {
  id: number;
  nombreCompleto: string;
  email: string;
  nombreUsuario: string;
  avatar?: string;
}

// Tarjeta de grupo (dashboard)
interface GrupoCardData {
  id: number;
  nombre: string;
  totalMiembros: number;
  totalSuscripciones: number;
}

// Miembro de grupo
interface MiembroUnidadResponse {
  id: number;
  usuario: UsuarioSummary;
  rol: RolMiembro;
  fechaUnion: string;
  estado: EstadoMiembro;
}

// Request de creación
interface CreateUnidadRequest {
  nombre: string;
  descripcion?: string;
}

// Tipos
type EstadoUnidadFamiliar = 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
type RolMiembro = 'ADMINISTRADOR' | 'MIEMBRO';
type EstadoMiembro = 'ACTIVO' | 'INACTIVO' | 'EXPULSADO';
```

### Interfaces de Suscripciones

```typescript
// Suscripción completa
interface SuscripcionResponse {
  id: number;
  servicio: ServicioSummary;
  idUnidad: number;
  anfitrion: {
    id: number;
    nombreCompleto: string;
    email: string;
    nombreUsuario: string;
  };
  precioTotal: number;
  moneda: string;
  precioPorPlaza: number;
  numPlazasTotal: number;
  anfitrionOcupaPlaza: boolean;
  fechaInicio: string;
  fechaRenovacion: string;
  periodicidad: Periodicidad;
  renovacionAutomatica: boolean;
  estado: EstadoSuscripcion;
  plazasDisponibles: number;
  plazasOcupadas: number;
}

// Resumen de suscripción
interface SuscripcionSummary {
  id: number;
  nombreServicio: string;
  logoServicio: string | null;
  precioPorPlaza: number;
  fechaRenovacion: string;
  periodicidad: Periodicidad;
  estado: EstadoSuscripcion;
  numPlazasTotal: number;
  plazasOcupadas: number;
}

// Request de creación
interface CreateSuscripcionRequest {
  idUnidad: number;
  idServicio?: number;
  nombreServicio?: string;
  precioTotal: number;
  numPlazasTotal: number;
  fechaInicio: string;
  periodicidad: Periodicidad;
  anfitrionOcupaPlaza?: boolean;
}

// Tipos
type EstadoSuscripcion = 'ACTIVA' | 'PAUSADA' | 'CANCELADA' | 'EXPIRADA';
type Periodicidad = 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL';
```

### Interfaces Genéricas

```typescript
// Respuesta paginada (Spring Data)
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Estado de recurso HTTP
interface ResourceState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

// Error de API
interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
  errors?: FieldError[];
}

interface FieldError {
  field: string;
  message: string;
}
```

---

## Manejo de Errores

### 1. Interceptor Global (`errorInterceptor`)

Captura todos los errores HTTP y muestra mensajes al usuario:

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isSilentErrorUrl(error.url) && !hasSkipErrorHandlingHeader(error)) {
        const message = getErrorMessage(error);
        toastService.error(message);
      }
      return throwError(() => error);
    })
  );
};
```

**Mapeo de códigos HTTP a mensajes:**

| Código | Mensaje                                                  |
|--------|----------------------------------------------------------|
| 0      | Sin conexión al servidor. Verifica tu conexión a internet. |
| 400    | Datos inválidos. Revisa la información e intenta nuevamente. |
| 401    | Sesión expirada. Por favor, inicia sesión nuevamente.   |
| 403    | No tienes permisos para realizar esta acción.            |
| 404    | Recurso no encontrado.                                   |
| 409    | Conflicto con datos existentes.                          |
| 422    | Datos no procesables. Revisa la información ingresada.   |
| 429    | Demasiadas peticiones. Espera un momento e intenta nuevamente. |
| 5xx    | Error del servidor. Intenta nuevamente más tarde.        |

**URLs con manejo silencioso (sin toast automático):**

- `/api/v1/auth/check-email` - Validación de email en formularios
- `/api/v1/auth/validate` - Validación de token en guards

**Saltar manejo global:**

```typescript
this.api.get('endpoint', {
  headers: { 'X-Skip-Error-Handling': 'true' }
});
```

### 2. Servicio de Dominio

Los servicios pueden aplicar transformaciones específicas:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  login(data: LoginData): Observable<User> {
    return this.api.post<AuthResponse>('auth/login', data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      map((response) => this.extractUser(response)),
      catchError((error) => this.handleAuthError(error)) // Manejo específico
    );
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error de autenticación';

    // Mensajes específicos de autenticación
    if (error.status === 401) {
      message = 'Credenciales incorrectas';
    } else if (error.status === 409) {
      message = 'Este email ya está registrado';
    }

    return throwError(() => ({ message, status: error.status }));
  }
}
```

### 3. Componente (UI)

Manejo de estados visuales:

```typescript
@Component({ /* ... */ })
export class DashboardComponent {
  protected readonly grupos = signal<GrupoCardData[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected recargarGrupos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.unidadService.getGruposCards().subscribe({
      next: (page) => {
        this.grupos.set(page.content);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los grupos. Intenta de nuevo.');
        this.isLoading.set(false);
        this.toastService.error('Error al cargar los grupos');
      },
    });
  }
}
```

**Template:**

```html
@if (isLoading()) {
  <app-spinner />
}

@if (error() && !isLoading()) {
  <div class="error-state">
    <p>{{ error() }}</p>
    <button (click)="recargarGrupos()">Reintentar</button>
  </div>
}

@if (grupos().length === 0 && !isLoading() && !error()) {
  <app-empty-state message="No tienes grupos todavía" />
}

@for (grupo of grupos(); track grupo.id) {
  <app-group-card [grupo]="grupo" />
}
```

### Retry Automático

Para operaciones críticas con fallos temporales:

```typescript
getDatosCriticos() {
  return this.api.get<Data>('endpoint', {
    retry: {
      maxRetries: 3,        // Número de reintentos
      delay: 1000,          // Delay entre reintentos (ms)
      onlyServerErrors: true // Solo reintentar en errores 5xx
    }
  });
}
```

---

## Estados de Carga

### LoadingService (Global)

Gestión automática del spinner global vía `loadingInterceptor`:

```typescript
@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);
  readonly isIdle = computed(() => !this.isLoading());
}
```

**Características:**

- Debounce de 200ms (evita parpadeos en requests rápidos)
- Mínimo visible de 300ms
- Contador de requests concurrentes
- Exclusiones configurables

**Excluir endpoint del loading global:**

```typescript
this.api.get('data', {
  headers: { 'X-Skip-Loading': 'true' }
});
```

### ResourceState (Local)

Patrón recomendado para estados locales de componentes:

```typescript
import { ResourceState, initialResourceState, loadingResourceState,
         errorResourceState, successResourceState } from '@models';

@Component({ /* ... */ })
export class MiComponente {
  state = signal(initialResourceState<Product[]>());

  loadData() {
    this.state.set(loadingResourceState());

    this.service.getData().subscribe({
      next: (data) => this.state.set(successResourceState(data)),
      error: (err) => this.state.set(errorResourceState(err.message))
    });
  }
}
```

**Template:**

```html
@if (state().loading) {
  <app-loading-inline />
}

@if (state().error) {
  <app-error-message [message]="state().error" />
}

@if (state().data; as data) {
  <ul>
    @for (item of data; track item.id) {
      <li>{{ item.name }}</li>
    }
  </ul>
}
```

---

## Buenas Prácticas

### 1. Tipado Estricto

Siempre tipar las respuestas HTTP:

```typescript
// ✅ CORRECTO
getData(): Observable<Product[]> {
  return this.api.get<Product[]>('products');
}

// ❌ INCORRECTO
getData() {
  return this.api.get('products'); // any implícito
}
```

### 2. Operadores RxJS

Usar operadores para transformar datos:

```typescript
getProductsViewModel(): Observable<ProductViewModel[]> {
  return this.api.get<Product[]>('products').pipe(
    map(products => products.map(p => ({
      ...p,
      priceWithTax: p.price * 1.21,
      formattedDate: new Date(p.createdAt)
    })))
  );
}
```

### 3. Manejo de Errores por Capas

- **Interceptor:** Errores genéricos + toast global
- **Servicio:** Transformaciones de negocio
- **Componente:** Estados visuales (loading, error, empty)

### 4. Paginación

Usar `HttpParams` para query parameters:

```typescript
getSuscripcionesGrupo(idUnidad: number, page = 0, size = 20): Observable<Page<SuscripcionSummary>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.api.get<Page<SuscripcionSummary>>(`suscripciones/unidad/${idUnidad}`, { params });
}
```

### 5. FormData para Uploads

```typescript
uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify({ type: 'avatar' }));

  return this.api.post<UploadResponse>('upload', formData);
  // authInterceptor detecta FormData y no añade Content-Type
}
```

### 6. Cancelación de Suscripciones

```typescript
// Con signals (recomendado Angular 21)
private readonly destroy$ = inject(DestroyRef);

loadData() {
  this.service.getData()
    .pipe(takeUntilDestroyed(this.destroy$))
    .subscribe(/* ... */);
}
```

### 7. Validadores Asíncronos

Para validación de formularios:

```typescript
codigoValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return this.unidadService.validarCodigo(control.value).pipe(
      map(() => null), // Código válido
      catchError(() => of({ codigoInvalido: true }))
    );
  };
}
```

### 8. Optimistic Updates

Para mejor UX en operaciones de escritura:

```typescript
deleteItem(id: number) {
  // 1. Actualizar UI inmediatamente
  const backup = this.items();
  this.items.update(items => items.filter(i => i.id !== id));

  // 2. Enviar request al servidor
  this.api.delete(`items/${id}`).subscribe({
    next: () => this.toast.success('Eliminado'),
    error: () => {
      // 3. Revertir si falla
      this.items.set(backup);
      this.toast.error('Error al eliminar');
    }
  });
}
```

---

## Resumen de Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `app.config.ts` | Configuración de HttpClient + interceptores |
| `core/services/api.service.ts` | Servicio base para todas las operaciones HTTP |
| `core/config/api.config.ts` | URL base y configuración HTTP |
| `interceptors/auth.interceptor.ts` | Autenticación + refresh token automático |
| `interceptors/loading.interceptor.ts` | Spinner global automático |
| `interceptors/logging.interceptor.ts` | Logging de requests/responses (desarrollo) |
| `interceptors/error.interceptor.ts` | Manejo global de errores + toasts |
| `models/*.model.ts` | Interfaces TypeScript para todas las respuestas |
| `services/*.ts` | Servicios de dominio que consumen ApiService |

---

**Última actualización:** 2026-01-15
**Versión Angular:** 21
**Versión API Backend:** v1
