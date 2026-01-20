import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommunicationService } from '@services/communication';
import { ToastService } from '@services/toast';
import { ButtonComponent } from '../button/button';
import { generateUUID } from '../../../utils/uuid';

/**
 * Componente emisor de ejemplo para demostrar comunicación entre hermanos.
 *
 * Muestra cómo:
 * - Usar ToastService para notificaciones visuales (toasts)
 * - Usar CommunicationService para estado compartido (usuario, filtros)
 * - Emitir eventos one-time entre componentes
 *
 * @remarks
 * Este componente actúa como emisor en el patrón Observer.
 * No necesita conocer qué componentes están escuchando sus mensajes.
 *
 * @usageNotes
 * ```html
 * <app-notification-sender />
 * ```
 */
@Component({
  selector: 'app-notification-sender',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './notification-sender.html',
  styleUrl: './notification-sender.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationSenderComponent {
  private readonly toastService = inject(ToastService);
  private readonly commService = inject(CommunicationService);

  // ========================================================================
  // ALERTAS VISUALES (usando ToastService)
  // ========================================================================

  /**
   * Envía una alerta de éxito (toast visual).
   */
  protected sendSuccessAlert(): void {
    this.toastService.success('¡Operación completada exitosamente!');
  }

  /**
   * Envía una alerta de error (toast visual).
   */
  protected sendErrorAlert(): void {
    this.toastService.error('Ha ocurrido un error en el proceso.');
  }

  /**
   * Envía una alerta informativa (toast visual).
   */
  protected sendInfoAlert(): void {
    this.toastService.info('Nueva información disponible.');
  }

  /**
   * Envía una alerta de advertencia (toast visual).
   */
  protected sendWarningAlert(): void {
    this.toastService.warning('Advertencia: revisa los datos ingresados.');
  }

  // ========================================================================
  // FILTROS COMPARTIDOS (usando CommunicationService)
  // ========================================================================

  /**
   * Actualiza filtros compartidos y notifica con evento.
   * Ejemplo de cómo sincronizar filtros entre componentes hermanos.
   */
  protected updateSharedFilters(): void {
    this.commService.updateFilters({
      searchTerm: 'Netflix',
      category: 'streaming',
    });

    // Emitir evento para que otros componentes reaccionen
    this.commService.emitEvent('filters-updated', {
      searchTerm: 'Netflix',
      category: 'streaming',
    });

    this.toastService.info('Filtros actualizados: Netflix en categoría streaming');
  }

  /**
   * Limpia filtros compartidos.
   */
  protected clearSharedFilters(): void {
    this.commService.clearFilters();
    this.commService.emitEvent('filters-cleared', null);
    this.toastService.warning('Filtros limpiados');
  }

  // ========================================================================
  // ESTADO DE USUARIO (usando CommunicationService)
  // ========================================================================

  /**
   * Simula login de usuario.
   */
  protected simulateLogin(): void {
    this.commService.updateUserState({
      id: generateUUID(),
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      isAuthenticated: true,
    });

    this.commService.emitEvent('user-logged-in', { name: 'Juan Pérez' });
    this.toastService.success('¡Bienvenido, Juan Pérez!');
  }

  /**
   * Simula logout de usuario.
   */
  protected simulateLogout(): void {
    this.commService.clearUserState();
    this.commService.emitEvent('user-logged-out', null);
    this.toastService.info('Sesión cerrada correctamente');
  }
}
