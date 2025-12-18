import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

/**
 * Tipo genérico para estado de usuario compartido
 */
export interface UserState {
  readonly id: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly isAuthenticated: boolean;
}

/**
 * Tipo genérico para filtros compartidos entre componentes
 */
export interface SharedFilters {
  readonly searchTerm: string;
  readonly category: string | null;
  readonly dateRange: { start: Date | null; end: Date | null } | null;
}

/**
 * Interfaz para eventos tipados del sistema
 */
export interface AppEvent<T = unknown> {
  readonly type: string;
  readonly payload: T;
}

/**
 * Servicio de comunicación entre componentes hermanos o no relacionados.
 *
 * Proporciona un sistema reactivo para compartir estado y eventos entre
 * componentes sin necesidad de usar @Input/@Output en jerarquías complejas.
 *
 * @remarks
 * - Usa BehaviorSubject para estado persistente (usuario, filtros)
 * - Usa Subject para eventos one-time sin persistencia
 * - Expone signals readonly para integración con Angular 21+
 * - Singleton: providedIn 'root' garantiza una única instancia
 *
 * @usageNotes
 * **Para notificaciones visuales (toasts), usa AlertService en su lugar.**
 *
 * **Estado de Usuario:**
 * ```typescript
 * // Emisor (ej: AuthService o LoginComponent)
 * this.commService.updateUserState({
 *   id: '123',
 *   name: 'Juan',
 *   email: 'juan@example.com',
 *   isAuthenticated: true,
 * });
 *
 * // Receptor (ej: HeaderComponent)
 * readonly user = this.commService.currentUser;
 * readonly isAuth = this.commService.isAuthenticated;
 * ```
 *
 * **Filtros Compartidos:**
 * ```typescript
 * // Sidebar de filtros
 * this.commService.updateFilters({ category: 'streaming' });
 *
 * // Tabla/listado
 * readonly filters = this.commService.currentFilters;
 * ```
 *
 * **Eventos One-Time:**
 * ```typescript
 * // Emisor
 * this.commService.emitEvent('subscription-created', { id: '456' });
 *
 * // Receptor
 * this.commService.events$
 *   .pipe(filter(e => e.type === 'subscription-created'))
 *   .subscribe(e => this.refreshList());
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  // ========================================================================
  // ESTADO DE USUARIO COMPARTIDO
  // ========================================================================

  private readonly userStateSubject = new BehaviorSubject<UserState>({
    id: null,
    name: null,
    email: null,
    isAuthenticated: false,
  });

  /**
   * Observable del estado de usuario.
   * Útil para operadores RxJS avanzados o pipes async.
   */
  readonly userState$: Observable<UserState> = this.userStateSubject.asObservable();

  /**
   * Signal reactivo con el estado actual del usuario.
   * Recomendado para templates y lógica de componentes.
   */
  readonly currentUser = signal<UserState>({
    id: null,
    name: null,
    email: null,
    isAuthenticated: false,
  });

  /**
   * Actualiza el estado del usuario.
   *
   * @param userState - Nuevo estado del usuario
   *
   * @example
   * ```typescript
   * this.commService.updateUserState({
   *   id: '123',
   *   name: 'Juan Pérez',
   *   email: 'juan@example.com',
   *   isAuthenticated: true,
   * });
   * ```
   */
  updateUserState(userState: UserState): void {
    this.userStateSubject.next(userState);
    this.currentUser.set(userState);
  }

  /**
   * Limpia el estado del usuario (logout).
   */
  clearUserState(): void {
    const emptyState: UserState = {
      id: null,
      name: null,
      email: null,
      isAuthenticated: false,
    };
    this.userStateSubject.next(emptyState);
    this.currentUser.set(emptyState);
  }

  // ========================================================================
  // FILTROS COMPARTIDOS
  // ========================================================================

  private readonly filtersSubject = new BehaviorSubject<SharedFilters>({
    searchTerm: '',
    category: null,
    dateRange: null,
  });

  /**
   * Observable de filtros compartidos.
   */
  readonly filters$: Observable<SharedFilters> = this.filtersSubject.asObservable();

  /**
   * Signal reactivo con los filtros actuales.
   */
  readonly currentFilters = signal<SharedFilters>({
    searchTerm: '',
    category: null,
    dateRange: null,
  });

  /**
   * Actualiza los filtros compartidos (merge parcial).
   *
   * @param filters - Filtros a actualizar (solo los campos proporcionados)
   *
   * @example
   * ```typescript
   * this.commService.updateFilters({ searchTerm: 'Netflix' });
   * this.commService.updateFilters({ category: 'streaming' });
   * ```
   */
  updateFilters(filters: Partial<SharedFilters>): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = { ...currentFilters, ...filters };
    this.filtersSubject.next(newFilters);
    this.currentFilters.set(newFilters);
  }

  /**
   * Resetea todos los filtros a sus valores iniciales.
   */
  clearFilters(): void {
    const emptyFilters: SharedFilters = {
      searchTerm: '',
      category: null,
      dateRange: null,
    };
    this.filtersSubject.next(emptyFilters);
    this.currentFilters.set(emptyFilters);
  }

  // ========================================================================
  // EVENTOS ONE-TIME
  // ========================================================================

  private readonly eventSubject = new Subject<AppEvent>();

  /**
   * Observable de eventos one-time.
   * Los suscriptores solo reciben eventos emitidos después de la suscripción.
   * Ideal para: navegación, acciones completadas, refresh de datos.
   */
  readonly events$: Observable<AppEvent> = this.eventSubject.asObservable();

  /**
   * Emite un evento one-time sin persistencia.
   *
   * @param type - Tipo de evento (ej: 'subscription-created', 'family-updated')
   * @param payload - Datos asociados al evento
   *
   * @example
   * ```typescript
   * this.commService.emitEvent('subscription-created', { id: '123', name: 'Netflix' });
   * this.commService.emitEvent('user-logout', null);
   * ```
   */
  emitEvent<T = unknown>(type: string, payload: T = null as T): void {
    this.eventSubject.next({ type, payload });
  }

  // ========================================================================
  // COMPUTED SIGNALS
  // ========================================================================

  /**
   * Signal computed que indica si hay un usuario autenticado.
   */
  readonly isAuthenticated = computed(() => this.currentUser().isAuthenticated);

  /**
   * Signal computed que indica si hay filtros activos.
   * Útil para mostrar botón de "Limpiar filtros".
   */
  readonly hasActiveFilters = computed(() => {
    const filters = this.currentFilters();
    return filters.searchTerm !== '' || filters.category !== null || filters.dateRange !== null;
  });
}
