import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Subject, ReplaySubject, Observable } from 'rxjs';

/**
 * Tipo para los diferentes tipos de notificación soportados
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Tipo genérico para mensajes de notificación del sistema
 */
export interface NotificationMessage {
  readonly id: string;
  readonly type: NotificationType;
  readonly message: string;
  readonly timestamp: number;
}

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
 * Servicio de comunicación entre componentes hermanos o no relacionados.
 *
 * Proporciona un sistema reactivo para compartir datos y notificaciones entre
 * componentes sin necesidad de usar @Input/@Output en jerarquías complejas.
 * Implementa el patrón Observer con BehaviorSubject para mantener estado
 * persistente y permitir suscripciones tardías.
 *
 * @remarks
 * - Usa BehaviorSubject internamente para retener el último valor emitido
 * - Expone signals readonly para integración con Angular 21+ reactive system
 * - Sigue el principio de unidirectional data flow
 * - Compatible con OnPush change detection strategy
 * - Singleton: providedIn 'root' garantiza una única instancia
 *
 * @usageNotes
 * **Componente Emisor (hermano1.ts):**
 * ```typescript
 * import { inject } from '@angular/core';
 * import { CommunicationService } from '@services/communication';
 *
 * export class Hermano1 {
 *   private readonly commService = inject(CommunicationService);
 *
 *   onAction(): void {
 *     this.commService.sendNotification({
 *       id: crypto.randomUUID(),
 *       type: 'success',
 *       message: 'Dato enviado desde Hermano 1',
 *       timestamp: Date.now(),
 *     });
 *   }
 * }
 * ```
 *
 * **Componente Receptor (hermano2.ts):**
 * ```typescript
 * import { inject, OnInit } from '@angular/core';
 * import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
 * import { CommunicationService } from '@services/communication';
 *
 * export class Hermano2 implements OnInit {
 *   private readonly commService = inject(CommunicationService);
 *   
 *   // Opción 1: Signal reactivo (recomendado para Angular 21+)
 *   readonly lastNotification = this.commService.lastNotification;
 *   
 *   // Opción 2: Observable tradicional con limpieza automática
 *   ngOnInit(): void {
 *     this.commService.notifications$
 *       .pipe(takeUntilDestroyed())
 *       .subscribe(notification => {
 *         console.log('Recibido:', notification);
 *       });
 *   }
 * }
 * ```
 *
 * **Template con AsyncPipe:**
 * ```html
 * @if (commService.notifications$ | async; as notification) {
 *   <p>{{ notification.message }}</p>
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  // ========================================================================
  // NOTIFICACIONES DEL SISTEMA
  // ========================================================================

  /**
   * Subject privado para notificaciones del sistema.
   * BehaviorSubject mantiene el último valor emitido para suscripciones tardías.
   */
  private readonly notificationSubject = new BehaviorSubject<NotificationMessage | null>(null);

  /**
   * Observable público de notificaciones.
   * Componentes pueden suscribirse para recibir actualizaciones reactivas.
   */
  readonly notifications$: Observable<NotificationMessage | null> =
    this.notificationSubject.asObservable();

  /**
   * Signal reactivo con la última notificación.
   * Integración nativa con el sistema de signals de Angular 21+.
   * @readonly
   */
  readonly lastNotification = signal<NotificationMessage | null>(null);

  /**
   * Envía una notificación a todos los componentes suscritos.
   *
   * @param notification - Objeto con los datos de la notificación
   *
   * @example
   * ```typescript
   * this.commService.sendNotification({
   *   id: crypto.randomUUID(),
   *   type: 'success',
   *   message: '¡Operación completada!',
   *   timestamp: Date.now(),
   * });
   * ```
   */
  sendNotification(notification: NotificationMessage): void {
    this.notificationSubject.next(notification);
    this.lastNotification.set(notification);
    this.addToHistory(notification);
  }

  /**
   * Limpia la notificación actual.
   * Útil para resetear el estado después de procesar una notificación.
   */
  clearNotification(): void {
    this.notificationSubject.next(null);
    this.lastNotification.set(null);
  }

  // ========================================================================
  // ESTADO DE USUARIO COMPARTIDO
  // ========================================================================

  /**
   * Subject privado para estado de usuario.
   */
  private readonly userStateSubject = new BehaviorSubject<UserState>({
    id: null,
    name: null,
    email: null,
    isAuthenticated: false,
  });

  /**
   * Observable público del estado de usuario.
   */
  readonly userState$: Observable<UserState> = this.userStateSubject.asObservable();

  /**
   * Signal reactivo con el estado actual del usuario.
   * @readonly
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
   * Limpia el estado del usuario (cierre de sesión).
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

  /**
   * Subject privado para filtros compartidos.
   */
  private readonly filtersSubject = new BehaviorSubject<SharedFilters>({
    searchTerm: '',
    category: null,
    dateRange: null,
  });

  /**
   * Observable público de filtros compartidos.
   */
  readonly filters$: Observable<SharedFilters> = this.filtersSubject.asObservable();

  /**
   * Signal reactivo con los filtros actuales.
   * @readonly
   */
  readonly currentFilters = signal<SharedFilters>({
    searchTerm: '',
    category: null,
    dateRange: null,
  });

  /**
   * Actualiza los filtros compartidos.
   *
   * @param filters - Nuevos filtros (actualización parcial)
   *
   * @example
   * ```typescript
   * this.commService.updateFilters({
   *   searchTerm: 'Angular',
   *   category: 'desarrollo',
   * });
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
  // ESTADO GENÉRICO
  // ========================================================================

  /**
   * Subject genérico para datos personalizados.
   * Útil para casos de uso específicos no cubiertos por los tipos anteriores.
   */
  private readonly genericDataSubject = new BehaviorSubject<Record<string, unknown>>({});

  /**
   * Observable público de datos genéricos.
   */
  readonly genericData$: Observable<Readonly<Record<string, unknown>>> =
    this.genericDataSubject.asObservable();

  /**
   * Signal reactivo con datos genéricos.
   * @readonly
   */
  readonly genericData = signal<Readonly<Record<string, unknown>>>({});

  /**
   * Actualiza un valor en el estado genérico.
   *
   * @param key - Clave del dato a actualizar
   * @param value - Nuevo valor
   *
   * @example
   * ```typescript
   * this.commService.setGenericData('cartItemCount', 5);
   * this.commService.setGenericData('selectedTheme', 'dark');
   * ```
   */
  setGenericData(key: string, value: unknown): void {
    const current = this.genericDataSubject.value;
    const updated = { ...current, [key]: value };
    this.genericDataSubject.next(updated);
    this.genericData.set(updated);
  }

  /**
   * Obtiene un valor del estado genérico.
   *
   * @param key - Clave del dato a obtener
   * @returns El valor almacenado o undefined si no existe
   */
  getGenericData<T>(key: string): T | undefined {
    return this.genericDataSubject.value[key] as T | undefined;
  }

  /**
   * Limpia todos los datos genéricos.
   */
  clearGenericData(): void {
    this.genericDataSubject.next({});
    this.genericData.set({});
  }

  // ========================================================================
  // EVENTOS ONE-TIME (Subject para eventos que no necesitan valor inicial)
  // ========================================================================

  /**
   * Subject para eventos one-time que no requieren persistencia.
   * Útil para clicks, logs, eventos del sistema sin estado.
   */
  private readonly eventSubject = new Subject<{ type: string; payload: unknown }>();

  /**
   * Observable de eventos one-time.
   * Los suscriptores solo reciben eventos emitidos después de la suscripción.
   */
  readonly events$: Observable<{ readonly type: string; readonly payload: unknown }> =
    this.eventSubject.asObservable();

  /**
   * Emite un evento one-time sin persistencia.
   *
   * @param type - Tipo de evento (ej: 'click', 'navigation', 'log')
   * @param payload - Datos del evento
   *
   * @example
   * ```typescript
   * this.commService.emitEvent('button-clicked', { buttonId: 'submit' });
   * ```
   */
  emitEvent(type: string, payload: unknown = null): void {
    this.eventSubject.next({ type, payload });
  }

  // ========================================================================
  // HISTORIAL DE NOTIFICACIONES (ReplaySubject para últimas N emisiones)
  // ========================================================================

  /**
   * ReplaySubject que mantiene las últimas 10 notificaciones.
   * Útil para mostrar historial reciente sin almacenamiento externo.
   */
  private readonly notificationHistorySubject = new ReplaySubject<NotificationMessage>(10);

  /**
   * Observable del historial de notificaciones.
   * Nuevos suscriptores reciben las últimas 10 notificaciones automáticamente.
   */
  readonly notificationHistory$: Observable<NotificationMessage> =
    this.notificationHistorySubject.asObservable();

  /**
   * Envía una notificación al historial.
   * Complementa sendNotification() manteniendo un buffer de las últimas notificaciones.
   *
   * @internal Este método es llamado automáticamente por sendNotification()
   */
  private addToHistory(notification: NotificationMessage): void {
    this.notificationHistorySubject.next(notification);
  }

  // ========================================================================
  // COMPUTED SIGNALS PARA LÓGICA DERIVADA
  // ========================================================================

  /**
   * Signal computed que indica si hay un usuario autenticado.
   * Derivado automáticamente del estado de usuario.
   */
  readonly isAuthenticated = computed(() => this.currentUser().isAuthenticated);

  /**
   * Signal computed que indica si hay filtros activos.
   * Útil para mostrar botón de "Limpiar filtros".
   */
  readonly hasActiveFilters = computed(() => {
    const filters = this.currentFilters();
    return (
      filters.searchTerm !== '' ||
      filters.category !== null ||
      filters.dateRange !== null
    );
  });
}
