# Plan de Implementación: Sistema de Estado Reactivo y Actualización Dinámica

> **Fecha**: 26 de enero de 2026
> **Versión**: 1.0
> **Estado**: Pendiente de aprobación

---

## 📋 Índice

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Análisis de Situación Actual](#-análisis-de-situación-actual)
3. [Objetivos y Alcance](#-objetivos-y-alcance)
4. [Arquitectura Propuesta](#-arquitectura-propuesta)
5. [Plan de Implementación](#-plan-de-implementación)
6. [Consideraciones Técnicas](#-consideraciones-técnicas)
7. [Testing y Validación](#-testing-y-validación)
8. [Checklist de Progreso](#-checklist-de-progreso)

---

## 🎯 Resumen Ejecutivo

Este documento define el plan de implementación para modernizar el sistema de gestión de estado de **Joinly**, eliminando recargas innecesarias de página y mejorando la experiencia de usuario mediante actualización dinámica y reactiva de la UI.

### Beneficios Esperados

- **UX mejorada**: Actualizaciones instantáneas sin perder contexto (scroll, filtros)
- **Rendimiento**: Reducción de llamadas HTTP redundantes mediante cache reactivo
- **Mantenibilidad**: Patrón de estado centralizado y predecible
- **Escalabilidad**: Base sólida para futuras features (WebSockets, notificaciones en tiempo real)

### Patrón Elegido

**Services + Angular Signals** — Nativo de Angular 21, sin librerías externas, compatible con OnPush, ideal para proyecto en crecimiento.

---

## 🔍 Análisis de Situación Actual

### Estado del Frontend

**Tecnología**: Angular 21 con standalone components
**Arquitectura**: Patrón híbrido Signals + Observables

#### Entidades Principales

| Entidad | Modelos | Servicios Existentes |
|---------|---------|---------------------|
| **Usuario** | `Usuario`, `UpdatePerfilRequest`, `PreferenciasNotificacion` | `AuthService`, `UsuarioService` |
| **Unidad Familiar** | `UnidadFamiliar`, `MiembroUnidadResponse`, `GrupoCardData` | `UnidadFamiliarService` |
| **Suscripción** | `SuscripcionResponse`, `SuscripcionDetalle`, `MiembroSuscripcion` | `SuscripcionService` |
| **Solicitud** | `SolicitudResponse`, `CreateSolicitudGrupoRequest` | `SolicitudService` |

#### Patrón Actual de Estado

```typescript
// ✅ Ya implementado en algunos servicios
AuthService: Signals (currentUser, isAuthenticated)
LoadingService: Signals + BehaviorSubject

// ❌ Falta implementar
UnidadFamiliarService: Solo métodos HTTP, sin cache reactivo
SuscripcionService: Solo métodos HTTP, sin cache reactivo
SolicitudService: Solo métodos HTTP, sin cache reactivo
```

#### Problemas Identificados

1. **Recargas manuales**: Los componentes llaman `refresh()` tras cada CRUD
2. **Estado duplicado**: Cada componente mantiene su propia copia de los datos
3. **Inconsistencias**: Actualizaciones en un componente no se reflejan en otros
4. **Sin cache**: Múltiples requests para los mismos datos
5. **Pérdida de contexto**: Navegación entre rutas pierde scroll y filtros

---

## 🎯 Objetivos y Alcance

### Objetivo Principal

Implementar un sistema de gestión de estado reactivo que actualice automáticamente la UI tras operaciones CRUD, sin recargas de página y manteniendo el contexto del usuario.

### Objetivos Específicos

#### 1. Sistema de Stores Reactivos
- [ ] Crear stores con Signals para cada entidad principal
- [ ] Implementar cache en memoria con invalidación automática
- [ ] Sincronización automática entre componentes suscritos

#### 2. Optimización de Rendimiento
- [ ] `ChangeDetectionStrategy.OnPush` en todos los componentes
- [ ] `trackBy` en todas las listas `*ngFor`
- [ ] Eliminar suscripciones manuales en favor de `async` pipe
- [ ] Computed signals para datos derivados

#### 3. Paginación e Infinite Scroll
- [ ] Paginación clásica con page/pageSize
- [ ] Infinite scroll con `IntersectionObserver`
- [ ] Loading states independientes por página

#### 4. Búsqueda y Filtrado en Tiempo Real
- [ ] Búsqueda con debounce (300ms)
- [ ] Filtrado local para datasets pequeños (<100 items)
- [ ] Filtrado remoto para grandes volúmenes
- [ ] Persistencia de filtros en navegación

#### 5. Preparación para Tiempo Real (Fase Futura)
- [ ] Arquitectura preparada para WebSockets
- [ ] Abstracción de fuente de datos (HTTP / WebSocket)

### Fuera de Alcance

- ❌ Implementación real de WebSockets (fase futura)
- ❌ Migración a NgRx/Akita (innecesario para el alcance actual)
- ❌ Refactorización completa de componentes existentes (solo los necesarios)
- ❌ Cambios en el backend (salvo que sea estrictamente necesario)

---

## 🏗️ Arquitectura Propuesta

### Patrón: Service Layer con Signals

```
┌─────────────────────────────────────────────────────────────┐
│                     COMPONENTES (Pages)                      │
│  - Inyectan Stores                                           │
│  - Leen Signals con async pipe o signals directos           │
│  - Llaman métodos del Store para mutaciones                 │
│  - ChangeDetectionStrategy.OnPush                           │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORE LAYER (Nuevo)                       │
│  - Mantiene estado en Signals                                │
│  - Expone Signals readonly                                   │
│  - Computed signals para datos derivados                     │
│  - Métodos para mutaciones (add, update, remove)            │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVICE LAYER (Existente)                       │
│  - Llamadas HTTP vía ApiService                             │
│  - Validaciones de negocio                                   │
│  - Transformación de DTOs                                    │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
        ┌──────────────────────┐
        │   API Backend REST   │
        │   /api/v1/*          │
        └──────────────────────┘
```

### Estructura de un Store

```typescript
// frontend/src/app/stores/grupos.store.ts
@Injectable({ providedIn: 'root' })
export class GruposStore {
  // Estado privado (writable)
  private _grupos = signal<UnidadFamiliar[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Estado público (readonly)
  readonly grupos = this._grupos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals (datos derivados)
  readonly totalGrupos = computed(() => this._grupos().length);
  readonly gruposActivos = computed(() =>
    this._grupos().filter(g => g.estado === 'ACTIVO')
  );

  constructor(
    private grupoService: UnidadFamiliarService,
    private toastService: ToastService
  ) {}

  // Carga inicial
  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const grupos = await firstValueFrom(
        this.grupoService.obtenerGruposAdministrados()
      );
      this._grupos.set(grupos);
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loading.set(false);
    }
  }

  // Mutaciones optimistas
  async add(grupo: UnidadFamiliar): Promise<void> {
    // Optimistic update
    this._grupos.update(list => [...list, grupo]);

    try {
      // Confirm con backend
      await firstValueFrom(this.grupoService.crear(grupo));
      this.toastService.success('Grupo creado');
    } catch (error) {
      // Rollback
      this._grupos.update(list => list.filter(g => g.id !== grupo.id));
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async update(grupo: UnidadFamiliar): Promise<void> {
    const previous = this._grupos();

    // Optimistic update
    this._grupos.update(list =>
      list.map(g => g.id === grupo.id ? grupo : g)
    );

    try {
      await firstValueFrom(this.grupoService.actualizar(grupo));
      this.toastService.success('Grupo actualizado');
    } catch (error) {
      // Rollback
      this._grupos.set(previous);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const previous = this._grupos();

    // Optimistic update
    this._grupos.update(list => list.filter(g => g.id !== id));

    try {
      await firstValueFrom(this.grupoService.eliminar(id));
      this.toastService.success('Grupo eliminado');
    } catch (error) {
      // Rollback
      this._grupos.set(previous);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  // Invalidar cache (reload desde API)
  async refresh(): Promise<void> {
    await this.load();
  }

  private handleError(error: any): string {
    return error?.message || 'Error desconocido';
  }
}
```

### Uso en Componentes

```typescript
// frontend/src/app/pages/dashboard/dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, GroupCardComponent]
})
export class DashboardComponent implements OnInit {
  // Inyectar store
  private gruposStore = inject(GruposStore);

  // Exponer signals como propiedades
  readonly grupos = this.gruposStore.grupos;
  readonly loading = this.gruposStore.loading;
  readonly totalGrupos = this.gruposStore.totalGrupos;

  async ngOnInit() {
    await this.gruposStore.load();
  }

  async crearGrupo(data: CreateGrupoDto) {
    await this.gruposStore.add(data);
    // UI se actualiza automáticamente
  }

  trackByGrupoId(index: number, grupo: UnidadFamiliar): string {
    return grupo.id;
  }
}
```

```html
<!-- dashboard.component.html -->
<div class="dashboard">
  @if (loading()) {
    <app-spinner-overlay />
  }

  <header class="dashboard__header">
    <h1>Mis Grupos</h1>
    <span class="badge">{{ totalGrupos() }}</span>
  </header>

  <div class="grupos-grid">
    @for (grupo of grupos(); track trackByGrupoId($index, grupo)) {
      <app-group-card
        [grupo]="grupo"
        (delete)="eliminarGrupo($event)"
      />
    } @empty {
      <app-empty-groups />
    }
  </div>
</div>
```

---

## 📅 Plan de Implementación

### Fase 1: Infraestructura Base (2-3 días)

#### 1.1. Crear estructura de Stores

```bash
frontend/src/app/stores/
├── index.ts                      # Barrel export
├── grupos.store.ts              # Store de Unidades Familiares
├── suscripciones.store.ts       # Store de Suscripciones
├── solicitudes.store.ts         # Store de Solicitudes
└── base.store.ts                # Clase abstracta (opcional)
```

**Checklist**:
- [ ] Crear directorio `frontend/src/app/stores`
- [ ] Implementar `GruposStore` con Signals
- [ ] Implementar `SuscripcionesStore` con Signals
- [ ] Implementar `SolicitudesStore` con Signals
- [ ] Crear barrel export en `index.ts`

#### 1.2. Extender servicios existentes

**Checklist**:
- [ ] Revisar `UnidadFamiliarService` — agregar métodos faltantes si es necesario
- [ ] Revisar `SuscripcionService` — agregar métodos faltantes si es necesario
- [ ] Revisar `SolicitudService` — agregar métodos faltantes si es necesario

#### 1.3. Configurar optimizaciones globales

**Checklist**:
- [ ] Habilitar `OnPush` en `app.config.ts` como estrategia por defecto (si aplicable)
- [ ] Configurar `scrollPositionRestoration: 'enabled'` en router (ya existe)
- [ ] Verificar configuración de `withViewTransitions()` (ya existe)

---

### Fase 2: Migración de Componentes Core (3-4 días)

#### 2.1. Dashboard

**Archivo**: `frontend/src/app/pages/dashboard/dashboard.component.ts`

**Cambios**:
- [ ] Inyectar `GruposStore`
- [ ] Reemplazar llamadas directas a servicio por store
- [ ] Usar signals directamente en template (eliminar `async` pipe si es signal puro)
- [ ] Agregar `trackBy` en `*ngFor` de grupos
- [ ] Cambiar a `ChangeDetectionStrategy.OnPush`
- [ ] Eliminar `refresh()` manual — se actualiza automáticamente

**Testing**:
- [ ] Verificar que la lista se actualiza tras crear grupo
- [ ] Verificar que no se pierde scroll al actualizar
- [ ] Verificar que el contador se actualiza automáticamente

#### 2.2. Detalle de Grupo

**Archivo**: `frontend/src/app/pages/grupos/detalle/grupo-detalle.component.ts`

**Cambios**:
- [ ] Inyectar `GruposStore` y `SuscripcionesStore`
- [ ] Cargar grupo desde store (cache) en lugar de resolver siempre desde API
- [ ] Actualizar suscripciones del grupo reactivamente
- [ ] Agregar `trackBy` en listas de miembros y suscripciones
- [ ] Cambiar a `ChangeDetectionStrategy.OnPush`

**Testing**:
- [ ] Verificar que los cambios en grupo se reflejan en dashboard sin recargar
- [ ] Verificar que agregar suscripción actualiza la lista instantáneamente

#### 2.3. Detalle de Suscripción

**Archivo**: `frontend/src/app/pages/suscripciones/detalle/suscripcion-detalle.component.ts`

**Cambios**:
- [ ] Inyectar `SuscripcionesStore` y `SolicitudesStore`
- [ ] Cargar suscripción desde store
- [ ] Actualizar miembros y solicitudes reactivamente
- [ ] Agregar `trackBy` en listas
- [ ] Cambiar a `ChangeDetectionStrategy.OnPush`

**Testing**:
- [ ] Verificar que aprobar solicitud actualiza lista de miembros instantáneamente
- [ ] Verificar que el estado de pago se actualiza correctamente

#### 2.4. Mis Solicitudes

**Archivo**: `frontend/src/app/pages/usuario/solicitudes/solicitudes.component.ts`

**Cambios**:
- [ ] Inyectar `SolicitudesStore`
- [ ] Implementar filtros locales (por tipo, estado)
- [ ] Agregar `trackBy` en lista de solicitudes
- [ ] Cambiar a `ChangeDetectionStrategy.OnPush`

**Testing**:
- [ ] Verificar que cancelar solicitud la elimina instantáneamente de la lista
- [ ] Verificar que los filtros funcionan en tiempo real

---

### Fase 3: Búsqueda y Filtrado (2 días)

#### 3.1. Implementar búsqueda en Dashboard

**Checklist**:
- [ ] Agregar `FormControl` para búsqueda
- [ ] Implementar `debounceTime(300)` y `distinctUntilChanged()`
- [ ] Crear computed signal `gruposFiltrados` en store
- [ ] Mantener búsqueda en store (persistencia durante navegación)

**Código**:
```typescript
// En GruposStore
private _searchTerm = signal('');
readonly searchTerm = this._searchTerm.asReadonly();

readonly gruposFiltrados = computed(() => {
  const term = this._searchTerm().toLowerCase();
  if (!term) return this._grupos();

  return this._grupos().filter(g =>
    g.nombre.toLowerCase().includes(term) ||
    g.descripcion?.toLowerCase().includes(term)
  );
});

setSearchTerm(term: string): void {
  this._searchTerm.set(term);
}
```

**Testing**:
- [ ] Verificar que la búsqueda filtra en tiempo real
- [ ] Verificar que no hay flickering (gracias a trackBy)
- [ ] Verificar que el término de búsqueda persiste al volver de detalle

#### 3.2. Implementar filtros en Suscripciones

**Checklist**:
- [ ] Agregar filtros por estado (`ACTIVA`, `PAUSADA`, `CANCELADA`)
- [ ] Agregar filtro por periodicidad (`MENSUAL`, `TRIMESTRAL`, `ANUAL`)
- [ ] Computed signal `suscripcionesFiltradas`
- [ ] UI con chips de filtro activo

**Testing**:
- [ ] Verificar que los filtros se combinan correctamente (AND logic)
- [ ] Verificar que limpiar filtros muestra todos los items

---

### Fase 4: Paginación e Infinite Scroll (2-3 días)

#### 4.1. Paginación Clásica

**Aplicar en**: Lista de suscripciones de un grupo

**Checklist**:
- [ ] Extender `SuscripcionesStore` con estado de paginación
- [ ] Implementar `page`, `pageSize`, `totalItems`, `totalPages`
- [ ] Crear métodos `nextPage()`, `prevPage()`, `goToPage(n)`
- [ ] Componente de paginación reutilizable

**Código**:
```typescript
// En SuscripcionesStore
private _page = signal(1);
private _pageSize = signal(10);

readonly page = this._page.asReadonly();
readonly pageSize = this._pageSize.asReadonly();

readonly suscripcionesPaginadas = computed(() => {
  const items = this._suscripciones();
  const page = this._page();
  const size = this._pageSize();
  const start = (page - 1) * size;
  return items.slice(start, start + size);
});

readonly totalPages = computed(() =>
  Math.ceil(this._suscripciones().length / this._pageSize())
);

nextPage(): void {
  const current = this._page();
  const max = this.totalPages();
  if (current < max) {
    this._page.set(current + 1);
  }
}

prevPage(): void {
  const current = this._page();
  if (current > 1) {
    this._page.set(current - 1);
  }
}
```

**Testing**:
- [ ] Verificar que cambiar de página no recarga datos
- [ ] Verificar que el scroll vuelve arriba al cambiar página
- [ ] Verificar que los controles de paginación se deshabilitan correctamente

#### 4.2. Infinite Scroll

**Aplicar en**: Feed de solicitudes pendientes (si hay muchas)

**Checklist**:
- [ ] Implementar directiva `InfiniteScrollDirective`
- [ ] Usar `IntersectionObserver` para detectar scroll al final
- [ ] Cargar páginas incrementales desde API
- [ ] Loading state independiente para cada página

**Código**:
```typescript
// frontend/src/app/directives/infinite-scroll.directive.ts
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Output() scrolled = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private sentinel = inject(ElementRef);

  ngOnInit() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.scrolled.emit();
        }
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
```

**Testing**:
- [ ] Verificar que se cargan más items al hacer scroll al final
- [ ] Verificar que no se disparan múltiples requests simultáneos
- [ ] Verificar que funciona en móvil

---

### Fase 5: Optimización y Pulido (2 días)

#### 5.1. Aplicar OnPush a todos los componentes

**Checklist**:
- [ ] Auditar todos los componentes sin `OnPush`
- [ ] Cambiar a `ChangeDetectionStrategy.OnPush`
- [ ] Verificar que no hay bugs de detección de cambios
- [ ] Usar `ChangeDetectorRef.markForCheck()` solo si es estrictamente necesario

#### 5.2. Agregar trackBy a todas las listas

**Checklist**:
- [ ] Auditar todos los `*ngFor` sin `trackBy`
- [ ] Implementar funciones `trackBy` por ID
- [ ] Verificar que no hay flickering en actualizaciones

#### 5.3. Eliminar suscripciones manuales

**Checklist**:
- [ ] Buscar todos los `subscribe()` manuales en componentes
- [ ] Reemplazar por `async` pipe o signals
- [ ] Eliminar `ngOnDestroy` innecesarios

#### 5.4. Computed signals para datos derivados

**Checklist**:
- [ ] Identificar cálculos repetidos en templates
- [ ] Extraer a computed signals en stores
- [ ] Ejemplo: totales, contadores, agregaciones

---

### Fase 6: Preparación para Tiempo Real (1 día)

#### 6.1. Abstracción de fuente de datos

**Objetivo**: Preparar stores para recibir actualizaciones desde WebSocket en el futuro

**Checklist**:
- [ ] Crear método `updateFromExternal(data)` en cada store
- [ ] Documentar cómo integrar WebSocket en el futuro
- [ ] NO implementar WebSocket todavía (fase futura)

**Código**:
```typescript
// En GruposStore
/**
 * Actualiza el store desde una fuente externa (ej: WebSocket).
 * Este método puede ser llamado cuando se recibe una notificación push.
 */
updateFromExternal(grupo: UnidadFamiliar): void {
  const exists = this._grupos().some(g => g.id === grupo.id);

  if (exists) {
    // Actualizar existente
    this._grupos.update(list =>
      list.map(g => g.id === grupo.id ? grupo : g)
    );
  } else {
    // Agregar nuevo
    this._grupos.update(list => [...list, grupo]);
  }

  this.toastService.info('Grupo actualizado por otro usuario');
}
```

---

## 🔧 Consideraciones Técnicas

### Gestión de Errores

```typescript
// Patrón centralizado en stores
private handleError(error: any): string {
  console.error('Error en store:', error);

  if (error.status === 401) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
  }

  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (error.status === 404) {
    return 'Recurso no encontrado.';
  }

  return error?.error?.message || error?.message || 'Error desconocido';
}
```

### Optimistic Updates con Rollback

```typescript
async remove(id: string): Promise<void> {
  // 1. Guardar estado anterior
  const previous = this._grupos();

  // 2. Actualizar optimistamente
  this._grupos.update(list => list.filter(g => g.id !== id));

  try {
    // 3. Confirmar con backend
    await firstValueFrom(this.grupoService.eliminar(id));
    this.toastService.success('Grupo eliminado');
  } catch (error) {
    // 4. Rollback en caso de error
    this._grupos.set(previous);
    this._error.set(this.handleError(error));
    this.toastService.error('Error al eliminar grupo');
    throw error;
  }
}
```

### Persistencia de Filtros

```typescript
// Guardar filtros en localStorage para persistencia entre sesiones
private saveFiltersToStorage(): void {
  const filters = {
    searchTerm: this._searchTerm(),
    estados: this._estadosFiltro(),
  };
  localStorage.setItem('grupos-filters', JSON.stringify(filters));
}

private loadFiltersFromStorage(): void {
  const saved = localStorage.getItem('grupos-filters');
  if (saved) {
    const filters = JSON.parse(saved);
    this._searchTerm.set(filters.searchTerm || '');
    this._estadosFiltro.set(filters.estados || []);
  }
}
```

### Manejo de Memoria

```typescript
// Limpiar cache cuando el usuario cierra sesión
clear(): void {
  this._grupos.set([]);
  this._loading.set(false);
  this._error.set(null);
  this._searchTerm.set('');
}
```

### Testing de Stores

```typescript
// frontend/src/app/stores/grupos.store.spec.ts
describe('GruposStore', () => {
  let store: GruposStore;
  let grupoService: jasmine.SpyObj<UnidadFamiliarService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UnidadFamiliarService', [
      'obtenerGruposAdministrados',
      'crear',
      'eliminar'
    ]);

    TestBed.configureTestingModule({
      providers: [
        GruposStore,
        { provide: UnidadFamiliarService, useValue: spy }
      ]
    });

    store = TestBed.inject(GruposStore);
    grupoService = TestBed.inject(UnidadFamiliarService) as jasmine.SpyObj<UnidadFamiliarService>;
  });

  it('debe cargar grupos', async () => {
    const mockGrupos = [{ id: '1', nombre: 'Familia' }];
    grupoService.obtenerGruposAdministrados.and.returnValue(of(mockGrupos));

    await store.load();

    expect(store.grupos()).toEqual(mockGrupos);
  });

  it('debe agregar grupo optimistamente', async () => {
    const nuevoGrupo = { id: '2', nombre: 'Amigos' };
    grupoService.crear.and.returnValue(of(nuevoGrupo));

    await store.add(nuevoGrupo);

    expect(store.grupos()).toContain(nuevoGrupo);
  });

  it('debe hacer rollback si falla la creación', async () => {
    const nuevoGrupo = { id: '3', nombre: 'Trabajo' };
    grupoService.crear.and.returnValue(throwError(() => new Error('Error')));

    try {
      await store.add(nuevoGrupo);
    } catch {}

    expect(store.grupos()).not.toContain(nuevoGrupo);
  });
});
```

---

## ✅ Testing y Validación

### Tests Unitarios

**Cobertura Mínima**: 80%

#### Stores
- [ ] Carga inicial de datos
- [ ] Mutaciones (add, update, remove)
- [ ] Optimistic updates + rollback
- [ ] Computed signals
- [ ] Manejo de errores

#### Componentes
- [ ] Renderizado con datos del store
- [ ] Interacciones que disparan mutaciones
- [ ] Estados de loading y error
- [ ] trackBy functions

### Tests de Integración

- [ ] Flujo completo: crear grupo → aparece en dashboard → editar → se refleja en detalle
- [ ] Flujo: solicitar plaza → aprobar → actualiza lista de miembros
- [ ] Flujo: buscar grupos → navegar a detalle → volver → búsqueda persiste

### Tests E2E (Opcional)

- [ ] Crear grupo y verificar aparición en dashboard sin reload
- [ ] Editar nombre de grupo y verificar actualización en múltiples vistas
- [ ] Eliminar grupo y verificar desaparición de todas las vistas

### Checklist de QA Manual

#### Performance
- [ ] Verificar que no hay múltiples requests HTTP para los mismos datos
- [ ] Verificar que OnPush reduce re-renderizados (usar Angular DevTools)
- [ ] Verificar que listas grandes (>50 items) se renderizan sin lag

#### UX
- [ ] Verificar que scroll no se pierde al actualizar listas
- [ ] Verificar que filtros persisten al navegar y volver
- [ ] Verificar que actualizaciones son instantáneas (sin delay perceptible)
- [ ] Verificar feedback visual en actualizaciones optimistas

#### Edge Cases
- [ ] Verificar comportamiento con lista vacía
- [ ] Verificar comportamiento con error de red
- [ ] Verificar comportamiento con token expirado
- [ ] Verificar rollback cuando falla mutación optimista

---

## 📊 Checklist de Progreso

### ✅ Fase 1: Infraestructura Base

#### Stores
- [ ] `GruposStore` creado e implementado
- [ ] `SuscripcionesStore` creado e implementado
- [ ] `SolicitudesStore` creado e implementado
- [ ] Barrel export configurado
- [ ] Tests unitarios de stores (>80% cobertura)

#### Configuración
- [ ] Verificar `scrollPositionRestoration` en router
- [ ] Verificar `withViewTransitions` en router
- [ ] Configurar estrategia OnPush por defecto (si aplicable)

---

### ✅ Fase 2: Migración de Componentes Core

#### Dashboard
- [ ] Migrado a `GruposStore`
- [ ] `trackBy` implementado
- [ ] `ChangeDetectionStrategy.OnPush` aplicado
- [ ] Eliminadas suscripciones manuales
- [ ] Tests actualizados
- [ ] QA manual completado

#### Grupo Detalle
- [ ] Migrado a `GruposStore` y `SuscripcionesStore`
- [ ] `trackBy` implementado en listas
- [ ] `ChangeDetectionStrategy.OnPush` aplicado
- [ ] Cache de grupo implementado
- [ ] Tests actualizados
- [ ] QA manual completado

#### Suscripción Detalle
- [ ] Migrado a `SuscripcionesStore` y `SolicitudesStore`
- [ ] `trackBy` implementado en listas
- [ ] `ChangeDetectionStrategy.OnPush` aplicado
- [ ] Actualización reactiva de miembros
- [ ] Tests actualizados
- [ ] QA manual completado

#### Mis Solicitudes
- [ ] Migrado a `SolicitudesStore`
- [ ] Filtros locales implementados
- [ ] `trackBy` implementado
- [ ] `ChangeDetectionStrategy.OnPush` aplicado
- [ ] Tests actualizados
- [ ] QA manual completado

---

### ✅ Fase 3: Búsqueda y Filtrado

#### Dashboard - Búsqueda
- [ ] `FormControl` con debounce implementado
- [ ] Computed signal `gruposFiltrados` en store
- [ ] Persistencia de búsqueda entre navegaciones
- [ ] Sin flickering en resultados
- [ ] Tests de búsqueda
- [ ] QA manual completado

#### Suscripciones - Filtros
- [ ] Filtros por estado implementados
- [ ] Filtros por periodicidad implementados
- [ ] Computed signal `suscripcionesFiltradas` en store
- [ ] UI de chips de filtro activo
- [ ] Lógica AND de filtros combinados
- [ ] Tests de filtros
- [ ] QA manual completado

---

### ✅ Fase 4: Paginación e Infinite Scroll

#### Paginación Clásica
- [ ] Estado de paginación en `SuscripcionesStore`
- [ ] Métodos `nextPage()`, `prevPage()`, `goToPage()`
- [ ] Componente de paginación reutilizable creado
- [ ] Computed signal `suscripcionesPaginadas`
- [ ] Scroll a top al cambiar página
- [ ] Tests de paginación
- [ ] QA manual completado

#### Infinite Scroll
- [ ] `InfiniteScrollDirective` implementada
- [ ] `IntersectionObserver` configurado
- [ ] Carga incremental desde API
- [ ] Loading state por página
- [ ] Prevención de múltiples requests
- [ ] Tests de infinite scroll
- [ ] QA manual en desktop y móvil

---

### ✅ Fase 5: Optimización y Pulido

#### OnPush
- [ ] Auditoría completa de componentes
- [ ] OnPush aplicado a todos los componentes page
- [ ] OnPush aplicado a componentes shared reutilizables
- [ ] Verificación de detección de cambios
- [ ] Tests actualizados

#### TrackBy
- [ ] Auditoría completa de `*ngFor`
- [ ] TrackBy implementado en todas las listas
- [ ] Verificación de no-flickering
- [ ] Tests actualizados

#### Suscripciones
- [ ] Auditoría de `subscribe()` manuales
- [ ] Reemplazo por `async` pipe o signals
- [ ] Eliminación de `ngOnDestroy` innecesarios
- [ ] Tests actualizados

#### Computed Signals
- [ ] Identificación de cálculos repetidos
- [ ] Extracción a computed signals
- [ ] Verificación de performance
- [ ] Tests actualizados

---

### ✅ Fase 6: Preparación para Tiempo Real

#### Abstracción
- [ ] Método `updateFromExternal()` en `GruposStore`
- [ ] Método `updateFromExternal()` en `SuscripcionesStore`
- [ ] Método `updateFromExternal()` en `SolicitudesStore`
- [ ] Documentación de integración WebSocket futura
- [ ] Tests de actualización externa

---

### ✅ Testing Final

#### Tests Unitarios
- [ ] Cobertura >80% en stores
- [ ] Cobertura >80% en componentes migrados
- [ ] Todos los tests pasando

#### Tests de Integración
- [ ] Flujo crear grupo → dashboard
- [ ] Flujo solicitar plaza → aprobar → miembros
- [ ] Flujo buscar → navegar → volver

#### Tests E2E (Opcional)
- [ ] Flujo completo de grupos
- [ ] Flujo completo de suscripciones
- [ ] Flujo completo de solicitudes

#### QA Manual Final
- [ ] Performance verificada (Chrome DevTools)
- [ ] UX verificada (scroll, filtros, persistencia)
- [ ] Edge cases verificados
- [ ] Compatibilidad móvil verificada

---

### ✅ Documentación (NO crear archivos innecesarios)

- [ ] Comentarios JSDoc en stores principales
- [ ] README actualizado (si es necesario)
- [ ] Ejemplos de uso en código

---

## 📝 Notas Finales

### Decisiones de Arquitectura

1. **Signals sobre NgRx**: Para el alcance actual del proyecto, Signals nativos de Angular 21 son suficientes. NgRx añadiría complejidad innecesaria.

2. **Optimistic Updates**: Mejoran la percepción de velocidad. Implementar rollback robusto es crítico.

3. **Computed Signals**: Reducen cálculos redundantes y aprovechan el sistema reactivo de Angular.

4. **OnPush Everywhere**: Reducción drástica de detección de cambios. Compatible con Signals.

### Métricas de Éxito

- **Performance**: Reducción del 50% en re-renderizados (medido con Angular DevTools)
- **UX**: 0 recargas de página tras operaciones CRUD
- **Mantenibilidad**: Patrón consistente en todos los stores
- **Testing**: >80% cobertura en stores y componentes críticos

### Próximos Pasos (Fases Futuras)

1. **WebSockets**: Notificaciones en tiempo real para actualizaciones de otros usuarios
2. **Service Worker**: Cache offline con sync background
3. **Virtual Scrolling**: Para listas extremadamente largas (>1000 items)

---

**Fin del documento**

> Este plan está diseñado para ser implementado de forma incremental. Cada fase puede desplegarse a producción independientemente.
