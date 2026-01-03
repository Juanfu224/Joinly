import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';
import type { SuscripcionCardData } from '../../../models/suscripcion.model';

/**
 * Componente de tarjeta de suscripción.
 * 
 * Muestra la información resumida de una suscripción compartida en formato de tarjeta,
 * siguiendo el diseño de Figma con sombras, espaciado y tipografía consistentes.
 * 
 * @usageNotes
 * ```html
 * <app-subscription-card 
 *   [suscripcion]="suscripcionData"
 *   (viewDetails)="handleViewDetails(suscripcionData)" />
 * ```
 * 
 * ### Características
 * - Diseño basado en Figma (tarjeta con sombras y bordes redondeados)
 * - Muestra: nombre del servicio, precio por plaza, fecha de renovación y plazas disponibles
 * - Botón de acción "Disponible" con estado visual
 * - OnPush change detection para rendimiento óptimo
 * - Signals para reactividad
 * - HTML semántico con elemento `<article>`
 */
@Component({
  selector: 'app-subscription-card',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  templateUrl: './subscription-card.html',
  styleUrls: ['./subscription-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionCardComponent {
  /**
   * Datos de la suscripción a mostrar
   */
  suscripcion = input.required<SuscripcionCardData>();

  /**
   * Evento emitido cuando se hace clic en el botón de ver detalles
   */
  viewDetails = output<void>();

  /**
   * Formatea la fecha de renovación en formato dd/mm/aa
   */
  protected readonly fechaFormateada = computed(() => {
    const fecha = new Date(this.suscripcion().fechaRenovacion);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString().slice(-2);
    return `${dia}/${mes}/${anio}`;
  });

  /**
   * Formatea el precio con 2 decimales
   */
  protected readonly precioFormateado = computed(() => {
    return this.suscripcion().precioPorPlaza.toFixed(2);
  });

  /**
   * Maneja el clic en el botón de ver detalles
   */
  handleViewDetails(): void {
    this.viewDetails.emit();
  }
}
