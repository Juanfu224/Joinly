import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Componente de estado vacío para grupos.
 *
 * Se muestra cuando el usuario no tiene grupos creados,
 * con icono de usuarios, mensaje y descripción centrados.
 * El contenedor padre debe proporcionar el fondo y las sombras.
 *
 * @usageNotes
 * ```html
 * <!-- Dentro de un contenedor con estilos de tarjeta -->
 * <section class="contenedor-con-fondo">
 *   <app-empty-groups />
 * </section>
 * ```
 *
 * ### Características
 * - Diseño centrado con icono circular
 * - Fondo transparente (no incluye estilos de tarjeta)
 * - Mensaje y descripción según diseño de Figma
 * - OnPush change detection para rendimiento óptimo
 * - HTML semántico con elemento `<section>`
 * - Sigue el patrón de componentes empty del proyecto
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
