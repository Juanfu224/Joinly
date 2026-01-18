import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';
import type { SolicitudResponse } from '../../../models';

/**
 * Componente Pending Requests Card - Tarjeta de solicitudes pendientes.
 *
 * Muestra una lista de solicitudes pendientes de unión a un grupo.
 * Solo visible para el administrador del grupo.
 *
 * @usageNotes
 * ```html
 * <app-pending-requests-card
 *   [solicitudes]="solicitudesPendientes"
 *   (acceptRequest)="handleAccept($event)"
 *   (rejectRequest)="handleReject($event)" />
 * ```
 *
 * ### Características
 * - Diseño consistente con otras cards del sistema
 * - Avatar del solicitante con fallback
 * - Botones de acción para aceptar/rechazar
 * - OnPush change detection para rendimiento óptimo
 * - Signals para reactividad completa
 */
@Component({
  selector: 'app-pending-requests-card',
  standalone: true,
  imports: [AvatarComponent, ButtonComponent, IconComponent],
  templateUrl: './pending-requests-card.html',
  styleUrl: './pending-requests-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingRequestsCardComponent {
  /**
   * Lista de solicitudes pendientes del grupo
   */
  solicitudes = input.required<SolicitudResponse[]>();

  /**
   * Evento emitido cuando se acepta una solicitud
   */
  acceptRequest = output<SolicitudResponse>();

  /**
   * Evento emitido cuando se rechaza una solicitud
   */
  rejectRequest = output<SolicitudResponse>();

  /**
   * Número de solicitudes pendientes
   */
  protected readonly count = computed(() => this.solicitudes().length);

  /**
   * Indica si hay solicitudes pendientes
   */
  protected readonly hasSolicitudes = computed(() => this.count() > 0);

  /**
   * Maneja el clic en aceptar solicitud
   */
  protected handleAccept(solicitud: SolicitudResponse): void {
    this.acceptRequest.emit(solicitud);
  }

  /**
   * Maneja el clic en rechazar solicitud
   */
  protected handleReject(solicitud: SolicitudResponse): void {
    this.rejectRequest.emit(solicitud);
  }
}
