import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Componente de estado vacío para grupos.
 * 
 * Se muestra cuando el usuario no tiene grupos creados,
 * siguiendo el diseño de Figma con icono de usuarios,
 * mensaje y descripción centrados.
 * 
 * @usageNotes
 * ```html
 * <app-empty-groups />
 * ```
 * 
 * ### Características
 * - Diseño centrado con icono circular
 * - Mensaje y descripción según diseño Figma
 * - OnPush change detection
 * - HTML semántico con elemento `<section>`
 */
@Component({
  selector: 'app-empty-groups',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './empty-groups.html',
  styleUrls: ['./empty-groups.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyGroupsComponent {}
