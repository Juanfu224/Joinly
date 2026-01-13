import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';
import { FormatSuscripcionesPipe } from '../../../utils';
import type { GrupoCardData } from '../../../models/grupo.model';

/**
 * Componente de tarjeta de grupo.
 * 
 * Muestra la información resumida de un grupo familiar en formato de tarjeta,
 * siguiendo el diseño de Figma con sombras, espaciado y tipografía consistentes.
 * 
 * @usageNotes
 * ```html
 * <app-group-card 
 *   [grupo]="grupoData"
 *   (invite)="handleInvite(grupoData)" />
 * ```
 * 
 * ### Características
 * - Diseño basado en Figma (tarjeta con sombras y bordes redondeados)
 * - Muestra: nombre, total de miembros y suscripciones
 * - Botón de invitar con icono integrado
 * - OnPush change detection para rendimiento óptimo
 * - Signals para reactividad
 * - HTML semántico con elemento `<article>`
 */
@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [IconComponent, ButtonComponent, FormatSuscripcionesPipe],
  templateUrl: './group-card.html',
  styleUrls: ['./group-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCardComponent {
  /**
   * Datos del grupo a mostrar
   */
  grupo = input.required<GrupoCardData>();

  /**
   * Evento emitido cuando se hace clic en el botón de invitar
   */
  invite = output<void>();

  /**
   * Maneja el clic en el botón de invitar
   */
  handleInvite(): void {
    this.invite.emit();
  }
}
