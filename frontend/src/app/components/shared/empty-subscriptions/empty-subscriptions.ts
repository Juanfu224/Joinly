import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Componente de estado vacío para suscripciones.
 *
 * Se muestra cuando el grupo no tiene suscripciones creadas,
 * siguiendo el diseño de Figma con icono de calendario,
 * mensaje y descripción centrados.
 *
 * @usageNotes
 * ```html
 * <app-empty-subscriptions />
 * ```
 *
 * ### Características
 * - Diseño centrado con icono circular
 * - Mensaje y descripción según diseño Figma
 * - OnPush change detection
 * - HTML semántico con elemento `<section>`
 */
@Component({
  selector: 'app-empty-subscriptions',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './empty-subscriptions.html',
  styleUrls: ['./empty-subscriptions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptySubscriptionsComponent {}
