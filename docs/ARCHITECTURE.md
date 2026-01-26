# Arquitectura del Sistema - Joinly

Este documento describe la arquitectura técnica del proyecto Joinly, incluyendo diagramas de alto nivel, flujo de datos, patrones de diseño y decisiones de implementación.

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
- [Arquitectura del Backend](#arquitectura-del-backend)
- [Arquitectura del Frontend](#arquitectura-del-frontend)
- [Flujo de Autenticación JWT](#flujo-de-autenticación-jwt)
- [Flujo de Datos entre Componentes](#flujo-de-datos-entre-componentes)
- [Patrones de Diseño](#patrones-de-diseño)
- [Modelo de Base de Datos](#modelo-de-base-de-datos)
- [API REST](#api-rest)

---

## Visión General

Joinly es una aplicación web de gestión de suscripciones compartidas con arquitectura cliente-servidor:

- **Backend**: API REST monolítica construida con Spring Boot 4.0
- **Frontend**: SPA (Single Page Application) construida con Angular 21
- **Base de Datos**: MySQL 8.0 relacional
- **Comunicación**: HTTP/HTTPS con JSON
- **Autenticación**: JWT con refresh tokens
- **Despliegue**: Docker containers con Nginx como reverse proxy

```
┌─────────────────┐     HTTPS     ┌─────────────────┐
│   Navegador     │◄────────────►│    Nginx        │
│  (Angular 21)   │              │ (Reverse Proxy) │
└─────────────────┘              └────────┬────────┘
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                              ▼            ▼            ▼
                      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                      │  Frontend   │ │  Backend    │ │    MySQL    │
                      │   Static    │ │(Spring Boot)│ │  Database   │
                      └─────────────┘ └─────────────┘ └─────────────┘
```

---

## Arquitectura de Alto Nivel

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYER: PRESENTATION                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Frontend (Angular 21)                           │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │ │
│  │  │ Components│  │   Pages   │  │  Guards   │  │ Services  │          │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘          │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │ │
│  │  │   Stores  │  │ Resolvers │  │ Interceptors│ │  Router   │          │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │ HTTP/JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYER: APPLICATION                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      Backend (Spring Boot 4.0)                           │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                        Controllers                               │  │ │
│  │  │  AuthController  │  UnidadFamiliarController  │  SuscripcionController│  │ │
│  │  │  UsuarioController│  PagoController  │  SolicitudController       │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                         Services                                 │  │ │
│  │  │  AuthService  │  UnidadFamiliarService  │  SuscripcionService      │  │ │
│  │  │  UsuarioService  │  PagoService  │  SolicitudService             │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                         DTOs                                      │  │ │
│  │  │  AuthRequest  │  AuthResponse  │  UnidadFamiliarResponse           │  │ │
│  │  │  SuscripcionDTO  │  PagoDTO  │  SolicitudDTO                     │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │ JPA/Hibernate
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYER: DOMAIN                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Domain Entities                                 │ │
│  │  Usuario  │  UnidadFamiliar  │  MiembroUnidad  │  Suscripcion          │ │
│  │  Plaza  │  Credencial  │  Pago  │  Solicitud  │  TicketSoporte        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Repositories                                    │ │
│  │  UsuarioRepository  │  UnidadFamiliarRepository  │  SuscripcionRepository│ │
│  │  PagoRepository  │  SolicitudRepository  │  TicketSoporteRepository     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │ JDBC
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYER: DATA                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      MySQL 8.0 Database                                 │ │
│  │  19 tablas con relaciones optimizadas y migraciones Flyway             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Arquitectura del Backend

### Capas del Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                           │
│  - Recibe requests HTTP                                      │
│  - Valida DTOs                                                │
│  - Delega a Services                                          │
│  - Retorna responses                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                              │
│  - Contiene lógica de negocio                                 │
│  - Opera sobre entidades y DTOs                              │
│  - Gestiona transacciones                                     │
│  - Lanza excepciones de negocio                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer (JPA)                    │
│  - Interfaz con la base de datos                             │
│  - Queries custom con @Query                                 │
│  - Paginación y ordenamiento                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (MySQL)                    │
│  - Almacenamiento persistente                                │
│  - Relaciones y constraints                                 │
│  - Índices optimizados                                       │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales del Backend

#### Controllers (Controladores)
- **AuthController**: Registro, login, refresh token, verificación de email
- **UsuarioController**: Perfil, búsqueda, actualización
- **UnidadFamiliarController**: CRUD, gestión de miembros, códigos de invitación
- **SuscripcionController**: CRUD, ocupar/liberar plazas, estados
- **PagoController**: Procesar, liberar, reembolsos
- **SolicitudController**: Aprobar/rechazar solicitudes de membresía
- **CredencialController**: Acceso encriptado a credenciales
- **NotificacionController**: Marcar leídas, listar
- **TicketSoporteController**: Crear, responder, cerrar tickets
- **DisputaController**: Abrir, resolver, escalar disputas
- **ServicioController**: Catálogo de servicios disponibles

#### Services (Servicios)
Cada controller tiene un service correspondiente que contiene la lógica de negocio:
- **AuthService**: Gestión de autenticación JWT
- **UnidadFamiliarService**: Lógica de grupos familiares
- **SuscripcionService**: Lógica de suscripciones
- **PagoService**: Lógica de pagos
- **SolicitudService**: Lógica de solicitudes de membresía
- **CredencialService**: Encriptación/desencriptación de credenciales
- **NotificacionService**: Lógica de notificaciones
- **TicketSoporteService**: Lógica de soporte
- **DisputaService**: Lógica de disputas

#### Entities (Entidades)
19 entidades JPA que representan las tablas de la base de datos:
- **Usuario**: Usuario del sistema
- **UnidadFamiliar**: Grupo familiar
- **MiembroUnidad**: Relación usuario-grupo
- **Suscripcion**: Suscripción compartida
- **Plaza**: Plaza en una suscripción
- **Credencial**: Credenciales encriptadas
- **Pago**: Transacción de pago
- **MetodoPago**: Método de pago del usuario
- **Solicitud**: Solicitud de membresía
- **Notificacion**: Notificación al usuario
- **TicketSoporte**: Ticket de soporte
- **MensajeTicket**: Mensaje en ticket
- **Disputa**: Disputa entre usuarios
- **HistorialCredencial**: Historial de cambios de credenciales
- **HistorialAnfitrion**: Historial de cambios de anfitrión
- **LogAuditoria**: Registro de acciones
- **Configuracion**: Configuraciones del sistema
- **Servicio**: Servicio de suscripción (Netflix, Spotify, etc.)
- **Token**: Token de recuperación de contraseña

#### Configuration (Configuraciones)
- **SecurityConfig**: Configuración de Spring Security, JWT filter
- **OpenApiConfig**: Configuración de Swagger/OpenAPI
- **CorsConfig**: Configuración de CORS
- **JwtProperties**: Propiedades JWT
- **WebConfig**: Configuración web general

#### Security (Seguridad)
- **JwtAuthenticationFilter**: Filtro de autenticación JWT
- **JwtTokenProvider**: Generación y validación de tokens JWT
- **JwtUserDetailsService**: Carga de usuarios para JWT

#### Exceptions (Excepciones)
- **GlobalExceptionHandler**: Manejo centralizado de excepciones
- **BusinessException**: Excepción base de negocio
- **ResourceNotFoundException**: Recurso no encontrado
- **DuplicateResourceException**: Recurso duplicado
- **BusinessRuleException**: Violación de regla de negocio
- **NoPlazasDisponiblesException**: No hay plazas disponibles
- **LimiteAlcanzadoException**: Límite alcanzado
- **UnauthorizedException**: No autorizado

---

## Arquitectura del Frontend

### Componentes del Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                      App Component                           │
│  - Componente raíz                                           │
│  - Configuración de rutas                                   │
│  - Proveedores globales                                      │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Layout     │  │    Pages     │  │ Components   │
│  Components  │  │              │  │  Reutilizables│
│              │  │  - Home      │  │              │
│  - Header     │  │  - Auth      │  │  - Forms     │
│  - Footer     │  │  - Dashboard │  │  - Cards     │
│  - Sidebar    │  │  - Perfil    │  │  - Modals    │
│              │  │  - Grupos    │  │  - Toasts    │
└──────────────┘  │  - Suscripciones│ │              │
                  │  - Pagos     │  │              │
                  │  - FAQ       │  │              │
                  └──────────────┘  └──────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services Layer                          │
│  - Comunicación HTTP con backend                             │
│  - Gestión de estado (Signals)                              │
│  - Lógica de negocio del frontend                            │
│                                                              │
│  Services principales:                                        │
│  - ApiService: Cliente HTTP base                             │
│  - AuthService: Autenticación                                │
│  - UnidadFamiliarService: Grupos familiares                 │
│  - SuscripcionService: Suscripciones                        │
│  - UsuarioService: Perfil de usuario                        │
│  - ModalService: Gestión de modales                         │
│  - ToastService: Notificaciones                              │
│  - ThemeService: Temas claro/oscuro                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Stores (Signals)                         │
│  - Estado global de la aplicación                            │
│  - Signals y computed para reactividad                       │
│                                                              │
│  Stores principales:                                          │
│  - grupos.store: Estado de grupos                            │
│  - suscripciones.store: Estado de suscripciones             │
│  - solicitudes.store: Estado de solicitudes                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Guards & Interceptors                   │
│  - AuthGuard: Protección de rutas autenticadas               │
│  - HomeGuard: Redirección de usuarios autenticados          │
│  - AuthInterceptor: Añade token JWT a requests              │
│  - ErrorInterceptor: Manejo de errores HTTP                 │
│  - LoadingInterceptor: Estado de carga global               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Resolvers                               │
│  - Carga de datos antes de navegar a una ruta                │
│  - DashboardResolver: Carga datos del dashboard              │
│  - GrupoDetalleResolver: Carga datos de un grupo            │
│  - SuscripcionDetalleResolver: Carga datos de suscripción   │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño del Frontend

#### 1. Standalone Components
Todos los componentes de Angular 21 son standalone, sin necesidad de NgModule:
```typescript
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, ...],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent { }
```

#### 2. Signals para Estado
Uso de signals en lugar de observables para estado local:
```typescript
private isLoading = signal(false);
readonly isLoading$ = this.isLoading.asReadonly();

login() {
  this.isLoading.set(true);
  // ...
}
```

#### 3. Input/Output Functions
Sin decoradores, usando functions:
```typescript
title = input.required<string>();
titleChange = output<string>();

@Effect()
updateTitle(newTitle: string) {
  this.titleChange.emit(newTitle);
}
```

#### 4. Control Flow Nativo
Uso de `@if`, `@for`, `@switch` en lugar de `*ngIf`, `*ngFor`:
```html
@if (loading) {
  <app-spinner />
} @else {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <app-card [item]="item" />
}
```

#### 5. OnPush Change Detection
Todos los componentes usan OnPush:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

---

## Flujo de Autenticación JWT

### Diagrama de Secuencia de Login

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Browser  │         │ Frontend │         │ Backend  │         │  MySQL   │
│ (Angular)│         │(Angular) │         │(Spring)  │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                   │                   │                    │
     │  1. Login Request │                   │                    │
     ├──────────────────>│                   │                    │
     │  (email/password) │                   │                    │
     │                   │                   │                    │
     │                   │  2. POST /api/v1/auth/login          │
     ├──────────────────────────────────────>│                    │
     │                   │                   │                    │
     │                   │                   │  3. SELECT user   │
     │                   ├──────────────────────────────────────>│
     │                   │                   │                    │
     │                   │                   │  4. Return user   │
     │                   │<──────────────────────────────────────┤
     │                   │                   │                    │
     │                   │                   │  5. Verify password│
     │                   │                   │  6. Generate tokens│
     │                   │                   │                    │
     │                   │  7. Response { accessToken,         │
     │                   │         refreshToken, user }          │
     │<──────────────────────────────────────┤                    │
     │                   │                   │                    │
     │  8. Save tokens   │                   │                    │
     │  in sessionStorage│                   │                    │
     │<──────────────────┤                   │                    │
     │                   │                   │                    │
     │  9. Navigate to   │                   │                    │
     │  dashboard        │                   │                    │
     │<──────────────────┤                   │                    │
```

### Token Management

**Access Token**:
- Duración: 15 minutos
- Contenido: UserID, roles, claims
- Almacenamiento: sessionStorage
- Uso: Cada request autenticado

**Refresh Token**:
- Duración: 7 días
- Contenido: UserID, unique ID
- Almacenamiento: httpOnly cookie (seguro contra XSS)
- Uso: Obtener nuevo access token sin re-login

**Flujo de Refresh Token**:
```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Browser  │         │ Frontend │         │ Backend  │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                   │                   │
     │  1. Token expired  │                   │
     ├──────────────────>│                   │
     │                   │                   │
     │                   │  2. POST /api/v1/auth/refresh
     ├──────────────────────────────────────>│
     │                   │                   │
     │                   │                   │  3. Verify refresh token
     │                   │                   │  4. Generate new access token
     │                   │                   │
     │                   │  5. Response { accessToken }
     │<──────────────────────────────────────┤
     │                   │                   │
     │  6. Update token  │                   │
     │  in sessionStorage│                   │
     │<──────────────────┤                   │
     │                   │                   │
     │  7. Retry original│                   │
     │  request          │                   │
     ├──────────────────>│                   │
```

---

## Flujo de Datos entre Componentes

### Comunicación Frontend-Backend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Angular 21)                               │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Component  │───>│   Service   │───>│  ApiService │───>│    HTTP     │  │
│  │             │    │             │    │             │    │  (fetch)    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│       │                  │                  │                  │             │
│       │                  │                  │                  │             │
│       │                  │                  │                  ▼             │
│       │                  │                  │         ┌──────────────┐      │
│       │                  │                  │         │  Interceptor │      │
│       │                  │                  │         │  (Auth/Error)│      │
│       │                  │                  │         └──────────────┘      │
│       │                  │                  │                  │             │
│       │                  │                  └──────────────────┤             │
│       │                  │                                     │             │
│       │                  └──────────────────────────────────────┤             │
│       │                                                         ▼             │
│       │                                             ┌─────────────────┐       │
│       │                                             │ Backend Server │       │
│       │                                             │  (Spring Boot) │       │
│       │                                             └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                                                              │
                                                                              │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (Spring Boot 4.0)                          │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  Controller  │───>│   Service    │───>│  Repository  │───>│   MySQL    │ │
│  │              │    │              │    │              │    │            │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────────────┘ │
│                                                                              │
│  ┌──────────────┐                                                          │
│  │   Global     │  - Captura todas las excepciones                        │
│  │  Exception   │  - Retorna respuestas HTTP consistentes                  │
│  │   Handler    │  - Logs errores apropiadamente                           │
│  └──────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos en el Frontend

#### Signals y Stores

Los stores usan signals para gestionar el estado de forma reactiva:

```typescript
// grupos.store.ts
export const gruposStore = signal<GrupoState>({
  grupos: [],
  loading: false,
  error: null
});

export const grupos = computed(() => gruposStore().grupos);
export const isLoading = computed(() => gruposStore().loading);
export const error = computed(() => gruposStore().error);

// Uso en un componente
@Component({
  // ...
})
export class DashboardComponent {
  readonly grupos = grupos;
  readonly isLoading = isLoading;

  constructor() {
    loadGrupos();
  }
}
```

#### Comunicación entre Componentes

1. **Padre → Hijo**: Inputs
```typescript
@Component({ standalone: true })
export class ParentComponent {
  data = signal('parent data');
}

@Component({ standalone: true })
export class ChildComponent {
  data = input.required<string>();
}
```

2. **Hijo → Padre**: Outputs
```typescript
@Component({ standalone: true })
export class ChildComponent {
  changed = output<string>();
}

@Component({ standalone: true })
export class ParentComponent {
  onChildChanged(newValue: string) {
    console.log(newValue);
  }
}
```

3. **Comunicación Global**: Services
```typescript
@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalOpen = signal(false);
  readonly modalOpen$ = this.modalOpen.asReadonly();

  open() { this.modalOpen.set(true); }
  close() { this.modalOpen.set(false); }
}
```

---

## Patrones de Diseño

### Patrones Implementados en el Backend

#### 1. Repository Pattern
Abstracción del acceso a datos:

```java
public interface UnidadFamiliarRepository extends JpaRepository<UnidadFamiliar, Long> {
    Optional<UnidadFamiliar> findByCodigo(String codigo);
    
    @Query("SELECT u FROM UnidadFamiliar u JOIN u.miembros m WHERE m.usuario.id = :usuarioId")
    List<UnidadFamiliar> findGruposUsuario(@Param("usuarioId") Long usuarioId);
}
```

#### 2. Service Layer Pattern
Lógica de negocio separada de controladores:

```java
@Service
@Transactional
public class UnidadFamiliarService {
    private final UnidadFamiliarRepository repository;
    
    public UnidadFamiliar createUnidad(CreateUnidadRequest request) {
        UnidadFamiliar unidad = new UnidadFamiliar();
        // Lógica de negocio...
        return repository.save(unidad);
    }
}
```

#### 3. DTO Pattern
Transferencia de datos separada de entidades:

```java
public class UnidadFamiliarResponse {
    private Long id;
    private String nombre;
    private String codigo;
    private int numMiembros;
    // Getters, setters, builders...
}
```

#### 4. Exception Handling Pattern
Manejo centralizado de excepciones:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

#### 5. Builder Pattern
Construcción de objetos complejos:

```java
@Entity
public class Suscripcion {
    public static SuscripcionBuilder builder() {
        return new SuscripcionBuilder();
    }
    
    public static class SuscripcionBuilder {
        private Suscripcion suscripcion = new Suscripcion();
        
        public SuscripcionBuilder servicio(Servicio servicio) {
            suscripcion.setServicio(servicio);
            return this;
        }
        
        public Suscripcion build() {
            return suscripcion;
        }
    }
}
```

### Patrones Implementados en el Frontend

#### 1. Observer Pattern (Signals)
Reactividad con signals:

```typescript
export const theme = signal<'light' | 'dark'>('light');

@Component({ standalone: true })
export class AppComponent {
  isDark = computed(() => this.theme() === 'dark');
}
```

#### 2. Singleton Pattern (Services)
Servicios con `providedIn: 'root'` son singletons:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<User | null>(null);
  // Solo una instancia en toda la aplicación
}
```

#### 3. Strategy Pattern (Guards)
Diferentes estrategias de protección de rutas:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthService).isAuthenticated() ? true : inject(Router).createUrlTree(['/auth/login']);
};

export const homeGuard: CanActivateFn = (route, state) => {
  return inject(AuthService).isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
```

#### 4. Dependency Injection Pattern
Inyección de dependencias con `inject()`:

```typescript
@Component({ standalone: true })
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
```

#### 5. Facade Pattern (API Service)
Interfaz simplificada para comunicación HTTP:

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
  
  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }
}
```

---

## Modelo de Base de Datos

### Relaciones Principales

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Usuario     │         │ UnidadFamiliar  │         │  Suscripcion    │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                          │                          │
         │ 1:N                      │ 1:N                      │
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  MiembroUnidad   │         │  Plaza          │         │   Credencial    │
│ (Usuario-Grupo) │         │ (en suscripcion)│         │ (encriptada)    │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                    │
                                    │ 1:N
                                    │
                                    ▼
                            ┌─────────────────┐
                            │      Pago        │
                            │ (por plaza)      │
                            └─────────────────┘
```

### Entidades y Relaciones Detalladas

**Core Entities:**
1. **Usuario**: Usuario del sistema
2. **UnidadFamiliar**: Grupo familiar
3. **MiembroUnidad**: Relación Usuario-UnidadFamiliar con rol
4. **Suscripcion**: Suscripción compartida
5. **Plaza**: Plaza disponible en suscripción
6. **Credencial**: Credenciales de acceso (encriptadas)
7. **Pago**: Pago por ocupar una plaza

**Supporting Entities:**
8. **MetodoPago**: Métodos de pago del usuario
9. **Solicitud**: Solicitudes de membresía
10. **Notificacion**: Notificaciones a usuarios
11. **TicketSoporte**: Tickets de soporte
12. **MensajeTicket**: Mensajes en ticket
13. **Disputa**: Disputas entre usuarios
14. **HistorialCredencial**: Historial de cambios de credenciales
15. **HistorialAnfitrion**: Historial de cambios de anfitrión
16. **LogAuditoria**: Registro de acciones
17. **Configuracion**: Configuraciones del sistema
18. **Servicio**: Catálogo de servicios
19. **Token**: Tokens de recuperación de contraseña

### Diagrama ER Simplificado

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       ├───< MiembroUnidad >───┬─── UnidadFamiliar
       │                      │
       ├─── MetodoPago         │
       ├─── Token              │
       └─── Notificacion       │
                              │
                              ├─── Suscripcion
                              │       │
                              │       ├─── Plaza ──── Credencial
                              │       │
                              │       └─── Pago
                              │
                              ├─── Solicitud
                              │
                              └─── TicketSoporte ──── MensajeTicket
                                      │
                                      └─── Disputa
```

Para el diagrama ER completo, ver: `backend/docs/Modelo%20ER/`

---

## API REST

### Convenciones de la API

#### Base URL
- Desarrollo: `http://localhost:8080/api/v1`
- Producción: `https://joinly.studio/api/v1`

#### Formato de Response
**Response Exitoso:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Response con Error:**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Recurso no encontrado"
  }
}
```

#### Códigos HTTP
- `200 OK`: Request exitoso
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Acción exitosa sin contenido de respuesta
- `400 Bad Request`: Request inválido
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (recurso duplicado)
- `422 Unprocessable Entity`: Error de validación
- `500 Internal Server Error`: Error del servidor

### Endpoints Principales

#### Autenticación (`/auth`)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar access token
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/verify-email` - Verificar email
- `POST /auth/forgot-password` - Solicitar recuperación
- `POST /auth/reset-password` - Restablecer contraseña

#### Usuarios (`/usuarios`)
- `GET /usuarios/me` - Obtener perfil actual
- `PUT /usuarios/me` - Actualizar perfil
- `GET /usuarios` - Buscar usuarios (admin)
- `GET /usuarios/{id}` - Obtener usuario por ID

#### Unidades Familiares (`/unidades`)
- `GET /unidades` - Listar grupos del usuario
- `POST /unidades` - Crear nuevo grupo
- `GET /unidades/{id}` - Obtener detalle de grupo
- `PUT /unidades/{id}` - Actualizar grupo
- `DELETE /unidades/{id}` - Eliminar grupo
- `POST /unidades/join` - Unirse por código
- `POST /unidades/{id}/expulsar` - Expulsar miembro
- `POST /unidades/{id}/abandonar` - Abandonar grupo

#### Suscripciones (`/suscripciones`)
- `GET /unidades/{unidadId}/suscripciones` - Listar suscripciones
- `POST /unidades/{unidadId}/suscripciones` - Crear suscripción
- `GET /suscripciones/{id}` - Obtener detalle
- `PUT /suscripciones/{id}` - Actualizar suscripción
- `DELETE /suscripciones/{id}` - Eliminar suscripción
- `POST /suscripciones/{id}/plazas/ocupar` - Ocupar plaza
- `POST /suscripciones/{id}/plazas/liberar` - Liberar plaza
- `GET /suscripciones/{id}/credenciales` - Obtener credenciales

#### Pagos (`/pagos`)
- `GET /suscripciones/{suscripcionId}/pagos` - Listar pagos
- `POST /pagos` - Procesar pago
- `POST /pagos/{id}/liberar` - Liberar pago a anfitrión
- `POST /pagos/{id}/reembolsar` - Reembolsar pago

#### Solicitudes (`/solicitudes`)
- `GET /solicitudes` - Listar solicitudes
- `POST /solicitudes` - Crear solicitud
- `POST /solicitudes/{id}/aprobar` - Aprobar solicitud
- `POST /solicitudes/{id}/rechazar` - Rechazar solicitud

#### Credenciales (`/credenciales`)
- `GET /suscripciones/{suscripcionId}/credenciales` - Obtener credenciales (miembros)
- `PUT /suscripciones/{suscripcionId}/credenciales` - Actualizar credenciales (anfitrión)

#### Notificaciones (`/notificaciones`)
- `GET /notificaciones` - Listar notificaciones
- `PUT /notificaciones/{id}/leer` - Marcar como leída
- `PUT /notificaciones/leer-todas` - Marcar todas como leídas

#### Tickets de Soporte (`/tickets`)
- `GET /tickets` - Listar tickets
- `POST /tickets` - Crear ticket
- `POST /tickets/{id}/mensajes` - Enviar mensaje
- `PUT /tickets/{id}/cerrar` - Cerrar ticket

#### Disputas (`/disputas`)
- `GET /disputas` - Listar disputas
- `POST /disputas` - Crear disputa
- `POST /disputas/{id}/resolver` - Resolver disputa

#### Servicios (`/servicios`)
- `GET /servicios` - Listar catálogo de servicios
- `GET /servicios/{id}` - Obtener detalle de servicio

### Documentación Interactiva

La API REST está completamente documentada con OpenAPI/Swagger:

- **Swagger UI**: `/swagger-ui.html`
- **OpenAPI JSON**: `/v3/api-docs`

---

## Conclusiones

La arquitectura de Joinly sigue las mejores prácticas de desarrollo web moderno:

- **Separación de responsabilidades**: Frontend y backend claramente separados
- **Escalabilidad**: Arquitectura lista para crecer en funcionalidad
- **Seguridad**: JWT, encriptación, CORS, CSRF
- **Mantenibilidad**: Código limpio, bien documentado, con tests
- **Performance**: Lazy loading, caching, optimización de bundles
- **Testing**: Cobertura de tests unitarios e integración
- **Documentación**: API REST documentada con Swagger

Para más detalles sobre decisiones arquitectónicas, ver los **Architecture Decision Records** en `docs/adr/`.
