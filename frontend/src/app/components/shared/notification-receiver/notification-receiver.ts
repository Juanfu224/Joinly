import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommunicationService, type NotificationMessage, type SharedFilters } from '@services/communication';

/**
 * Componente receptor de ejemplo para demostrar comunicación entre hermanos.
 *
 * Escucha notificaciones y cambios de estado del CommunicationService,
 * reaccionando automáticamente a las actualizaciones emitidas por otros
 * componentes hermanos o distantes.
 *
 * @remarks
 * Este componente actúa como receptor/observador en el patrón Observer.
 * Demuestra dos enfoques de suscripción:
 * 1. Signals reactivos (Angular 21+, recomendado)
 * 2. Observables tradicionales con takeUntilDestroyed()
 *
 * @usageNotes
 * ```html
 * <app-notification-receiver />
 * ```
 */
@Component({
  selector: 'app-notification-receiver',
  standalone: true,
  imports: [],
  templateUrl: './notification-receiver.html',
  styleUrl: './notification-receiver.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationReceiverComponent {
  private readonly commService = inject(CommunicationService);

  // ========================================================================
  // ENFOQUE 1: SIGNALS REACTIVOS (RECOMENDADO PARA ANGULAR 21+)
  // ========================================================================

  /**
   * Signal reactivo con la última notificación.
   * Actualización automática sin necesidad de suscripciones manuales.
   */
  protected readonly lastNotification = this.commService.lastNotification;

  /**
   * Signal reactivo con el estado actual del usuario.
   */
  protected readonly currentUser = this.commService.currentUser;

  /**
   * Signal reactivo con los filtros actuales.
   */
  protected readonly currentFilters = this.commService.currentFilters;

  /**
   * Signal reactivo con datos genéricos.
   */
  protected readonly genericData = this.commService.genericData;

  /**
   * Signal local para historial de notificaciones recibidas.
   * Demuestra cómo acumular eventos en el tiempo.
   */
  protected readonly notificationHistory = signal<NotificationMessage[]>([]);

  /**
   * Signal computed para mostrar si hay usuario autenticado.
   * Derivado automáticamente del servicio.
   */
  protected readonly isAuthenticated = this.commService.isAuthenticated;

  /**
   * Signal computed para mostrar si hay filtros activos.
   */
  protected readonly hasActiveFilters = this.commService.hasActiveFilters;

  constructor() {
    // Suscripción automática con limpieza al destruir el componente
    // takeUntilDestroyed() solo funciona en constructor o injection context
    this.setupNotificationListener();
    this.setupFiltersListener();
  }

  /**
   * Configura listener para notificaciones.
   * Demuestra cómo procesar eventos del stream y actualizar estado local.
   */
  private setupNotificationListener(): void {
    this.commService.notifications$.pipe(takeUntilDestroyed()).subscribe((notification: NotificationMessage | null) => {
      if (notification) {
        console.log('📨 Notificación recibida:', notification);

        // Agregar al historial (mantener últimas 10)
        this.notificationHistory.update((history) => {
          const newHistory = [notification, ...history];
          return newHistory.slice(0, 10);
        });
      }
    });
  }

  /**
   * Configura listener para cambios de filtros.
   * Demuestra cómo reaccionar a cambios sin modificar el estado local.
   */
  private setupFiltersListener(): void {
    this.commService.filters$.pipe(takeUntilDestroyed()).subscribe((filters: SharedFilters) => {
      console.log('🔍 Filtros actualizados:', filters);
    });
  }

  /**
   * Limpia el historial de notificaciones.
   */
  protected clearHistory(): void {
    this.notificationHistory.set([]);
  }

  /**
   * Formatea la fecha de una notificación de manera legible.
   */
  protected formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Obtiene el icono según el tipo de notificación.
   */
  protected getNotificationIcon(type: NotificationMessage['type']): string {
    const icons: Record<NotificationMessage['type'], string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type];
  }

  /**
   * Obtiene la clase CSS según el tipo de notificación.
   */
  protected getNotificationClass(type: NotificationMessage['type']): string {
    return `notification-receiver__notification--${type}`;
  }
}
