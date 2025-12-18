import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommunicationService, type AppEvent } from '@services/communication';

/**
 * Componente receptor de ejemplo para demostrar comunicación entre hermanos.
 *
 * Muestra cómo:
 * - Consumir estado compartido mediante Signals (usuario, filtros)
 * - Escuchar eventos one-time mediante Observables
 * - Usar computed signals para lógica derivada
 *
 * @remarks
 * Este componente actúa como receptor/observador en el patrón Observer.
 * Demuestra el enfoque recomendado: Signals para estado, Observable para eventos.
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
  // SIGNALS REACTIVOS (consumo directo del servicio)
  // ========================================================================

  /**
   * Signal reactivo con el estado actual del usuario.
   */
  protected readonly currentUser = this.commService.currentUser;

  /**
   * Signal reactivo con los filtros actuales.
   */
  protected readonly currentFilters = this.commService.currentFilters;

  /**
   * Signal computed para mostrar si hay usuario autenticado.
   */
  protected readonly isAuthenticated = this.commService.isAuthenticated;

  /**
   * Signal computed para mostrar si hay filtros activos.
   */
  protected readonly hasActiveFilters = this.commService.hasActiveFilters;

  // ========================================================================
  // HISTORIAL DE EVENTOS (para demostración)
  // ========================================================================

  /**
   * Signal local para historial de eventos recibidos.
   * Demuestra cómo acumular eventos one-time en el tiempo.
   */
  protected readonly eventHistory = signal<AppEvent[]>([]);

  constructor() {
    this.setupEventListener();
  }

  /**
   * Configura listener para eventos one-time.
   * Demuestra cómo procesar eventos del stream y actualizar estado local.
   */
  private setupEventListener(): void {
    this.commService.events$.pipe(takeUntilDestroyed()).subscribe((event: AppEvent) => {
      console.log('📨 Evento recibido:', event);

      // Agregar al historial (mantener últimos 10)
      this.eventHistory.update((history) => {
        const newHistory = [event, ...history];
        return newHistory.slice(0, 10);
      });
    });
  }

  /**
   * Limpia el historial de eventos.
   */
  protected clearHistory(): void {
    this.eventHistory.set([]);
  }

  /**
   * Formatea el payload de un evento para mostrar.
   */
  protected formatPayload(payload: unknown): string {
    if (payload === null || payload === undefined) {
      return 'null';
    }
    if (typeof payload === 'object') {
      return JSON.stringify(payload, null, 2);
    }
    return String(payload);
  }

  /**
   * Obtiene un emoji según el tipo de evento.
   */
  protected getEventIcon(type: string): string {
    if (type.includes('login') || type.includes('user')) return '👤';
    if (type.includes('logout')) return '🚪';
    if (type.includes('filter')) return '🔍';
    if (type.includes('created')) return '✨';
    if (type.includes('updated')) return '📝';
    if (type.includes('deleted') || type.includes('cleared')) return '��️';
    return '📌';
  }
}
