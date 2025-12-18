import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommunicationService, type NotificationMessage } from '@services/communication';
import { ButtonComponent } from '../button/button';

/**
 * Componente emisor de ejemplo para demostrar comunicación entre hermanos.
 *
 * Envía notificaciones a través del CommunicationService cuando el usuario
 * realiza acciones específicas (clicks en botones, actualización de filtros, etc.).
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
  private readonly commService = inject(CommunicationService);

  /**
   * Envía una notificación de éxito.
   * Ejemplo de comunicación one-way hacia componentes hermanos o distantes.
   */
  protected sendSuccessNotification(): void {
    const notification: NotificationMessage = {
      id: crypto.randomUUID(),
      type: 'success',
      message: '¡Operación completada exitosamente desde Hermano 1!',
      timestamp: Date.now(),
    };
    this.commService.sendNotification(notification);
  }

  /**
   * Envía una notificación de error.
   */
  protected sendErrorNotification(): void {
    const notification: NotificationMessage = {
      id: crypto.randomUUID(),
      type: 'error',
      message: 'Ha ocurrido un error en el proceso.',
      timestamp: Date.now(),
    };
    this.commService.sendNotification(notification);
  }

  /**
   * Envía una notificación de información.
   */
  protected sendInfoNotification(): void {
    const notification: NotificationMessage = {
      id: crypto.randomUUID(),
      type: 'info',
      message: 'Nueva información disponible.',
      timestamp: Date.now(),
    };
    this.commService.sendNotification(notification);
  }

  /**
   * Actualiza filtros compartidos.
   * Ejemplo de cómo sincronizar filtros entre componentes hermanos.
   */
  protected updateSharedFilters(): void {
    this.commService.updateFilters({
      searchTerm: 'Angular 21',
      category: 'desarrollo',
    });

    // Enviar notificación de confirmación
    this.commService.sendNotification({
      id: crypto.randomUUID(),
      type: 'info',
      message: 'Filtros actualizados: Angular 21 en categoría desarrollo',
      timestamp: Date.now(),
    });
  }

  /**
   * Limpia filtros compartidos.
   */
  protected clearSharedFilters(): void {
    this.commService.clearFilters();

    this.commService.sendNotification({
      id: crypto.randomUUID(),
      type: 'warning',
      message: 'Filtros limpiados',
      timestamp: Date.now(),
    });
  }

  /**
   * Simula actualización de estado de usuario.
   */
  protected updateUserState(): void {
    this.commService.updateUserState({
      id: '12345',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      isAuthenticated: true,
    });

    this.commService.sendNotification({
      id: crypto.randomUUID(),
      type: 'success',
      message: 'Estado de usuario actualizado',
      timestamp: Date.now(),
    });
  }
}
