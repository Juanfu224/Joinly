import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { AvatarComponent } from '../avatar/avatar';
import { ButtonComponent } from '../button/button';

/**
 * Estado del pago de una suscripción
 */
export type PaymentStatus =
  | 'PENDIENTE'
  | 'FALLIDO'
  | 'RETENIDO'
  | 'LIBERADO'
  | 'REEMBOLSADO'
  | 'REEMBOLSO_PARCIAL'
  | 'DISPUTADO';

/**
 * Datos de las credenciales de acceso de una suscripción
 */
export interface SubscriptionCredentials {
  usuario: string;
  contrasena: string;
}

/**
 * Datos del estado del pago de una suscripción
 */
export interface PaymentInfo {
  montoRetenido: number;
  estado: PaymentStatus;
  fechaLiberacion: string;
}

/**
 * Solicitud de unión a un grupo para compartir suscripción
 */
export interface JoinRequest {
  id: number;
  nombreUsuario: string;
  email: string;
  avatarUrl?: string;
}

/**
 * Datos completos de información de suscripción
 */
export interface SubscriptionInfoData {
  credenciales: SubscriptionCredentials;
  pago: PaymentInfo;
  solicitudes: JoinRequest[];
}

/**
 * Componente Subscription Info Card - Tarjeta de información de suscripción.
 *
 * Muestra información detallada de una suscripción compartida con dos pestañas:
 * - **Información**: Credenciales de acceso y estado del pago
 * - **Solicitudes**: Lista de solicitudes de unión pendientes
 *
 * @usageNotes
 * ```html
 * <app-subscription-info-card
 *   [info]="subscriptionInfo"
 *   (acceptRequest)="handleAccept($event)"
 *   (rejectRequest)="handleReject($event)" />
 * ```
 *
 * ### Características
 * - Diseño basado en Figma con sombras y bordes redondeados
 * - Sistema de pestañas integrado (Información / Solicitudes)
 * - Badge con contador de solicitudes pendientes
 * - Botones de acción para aceptar/rechazar solicitudes
 * - OnPush change detection para rendimiento óptimo
 * - Signals para reactividad completa
 * - HTML semántico y accesible (ARIA)
 */
@Component({
  selector: 'app-subscription-info-card',
  standalone: true,
  imports: [AvatarComponent, ButtonComponent],
  templateUrl: './subscription-info-card.html',
  styleUrl: './subscription-info-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionInfoCardComponent {
  /**
   * Datos completos de información de la suscripción
   */
  info = input.required<SubscriptionInfoData>();

  /**
   * Indica si el usuario actual es administrador (anfitrión) de la suscripción
   */
  isAdmin = input<boolean>(false);

  /**
   * Evento emitido cuando se acepta una solicitud de unión
   */
  acceptRequest = output<JoinRequest>();

  /**
   * Evento emitido cuando se rechaza una solicitud de unión
   */
  rejectRequest = output<JoinRequest>();

  /**
   * Signal que controla la pestaña activa: 'info' o 'requests'
   */
  protected readonly activeTab = signal<'info' | 'requests'>('info');

  /**
   * Verifica si hay credenciales configuradas
   */
  protected readonly hasCredenciales = computed(() => {
    const cred = this.info().credenciales;
    return !!(cred.usuario?.trim() || cred.contrasena?.trim());
  });

  /**
   * Número de solicitudes pendientes
   */
  protected readonly requestsCount = computed(() => this.info().solicitudes.length);

  /**
   * Texto del badge de solicitudes
   */
  protected readonly requestsBadgeText = computed(() => {
    const count = this.requestsCount();
    return count > 0 ? `Solicitudes (${count})` : 'Solicitudes';
  });

  /**
   * Texto del estado del pago formateado
   */
  protected readonly paymentStatusText = computed(() => {
    const estado = this.info().pago.estado;
    const textos: Record<PaymentStatus, string> = {
      PENDIENTE: 'Pendiente',
      FALLIDO: 'Fallido',
      RETENIDO: 'Retenido',
      LIBERADO: 'Liberado',
      REEMBOLSADO: 'Reembolsado',
      REEMBOLSO_PARCIAL: 'Reembolso parcial',
      DISPUTADO: 'Disputado',
    };
    return textos[estado] ?? 'Desconocido';
  });

  /**
   * Monto retenido formateado con símbolo de euro
   */
  protected readonly formattedAmount = computed(() => {
    return `${this.info().pago.montoRetenido.toFixed(2).replace('.', ',')}€`;
  });

  /**
   * Fecha de liberación formateada
   */
  protected readonly formattedReleaseDate = computed(() => {
    const fecha = new Date(this.info().pago.fechaLiberacion);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  });

  /**
   * Cambia la pestaña activa
   */
  protected setActiveTab(tab: 'info' | 'requests'): void {
    this.activeTab.set(tab);
  }

  /**
   * Maneja el clic en aceptar solicitud
   */
  protected handleAccept(request: JoinRequest): void {
    this.acceptRequest.emit(request);
  }

  /**
   * Maneja el clic en rechazar solicitud
   */
  protected handleReject(request: JoinRequest): void {
    this.rejectRequest.emit(request);
  }
}
