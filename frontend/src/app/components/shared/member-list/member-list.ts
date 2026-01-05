import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MemberCardComponent, type MemberData } from '../member-card/member-card';
import { IconComponent } from '../icon/icon';

/**
 * Componente de lista de miembros.
 * 
 * Muestra una sección con encabezado, contador de miembros y
 * un grid de tarjetas individuales para cada miembro del grupo o suscripción.
 * Sigue el diseño de Figma con sombras, bordes y espaciado consistentes.
 * 
 * @usageNotes
 * ```html
 * <!-- Lista de miembros básica -->
 * <app-member-list [members]="miembros" />
 *
 * <!-- Con título personalizado -->
 * <app-member-list [members]="usuarios" titulo="Participantes" />
 * ```
 * 
 * ### Características
 * - Diseño basado en Figma (sección con sombras y bordes redondeados)
 * - Muestra: título, contador con icono y grid de tarjetas
 * - Mensaje vacío cuando no hay miembros
 * - OnPush change detection para rendimiento óptimo
 * - Signals para reactividad
 * - HTML semántico con elemento `<section>`
 */
@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, IconComponent],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberListComponent {
  /**
   * Lista de miembros a mostrar
   */
  members = input.required<MemberData[]>();

  /**
   * Título de la sección (por defecto "Miembros")
   */
  titulo = input<string>('Miembros');

  /**
   * Número total de miembros
   */
  protected readonly totalMembers = computed(() => this.members().length);

  /**
   * Indica si hay miembros para mostrar
   */
  protected readonly hasMembers = computed(() => this.members().length > 0);
}
