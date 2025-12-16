import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Representa un elemento en la navegación de migas de pan.
 */
export interface BreadcrumbItem {
  /** Texto que se muestra para este elemento */
  label: string;
  /** URL de navegación (opcional, el último elemento no debe tener URL) */
  url?: string;
}

/**
 * Componente de navegación de migas de pan (breadcrumbs).
 *
 * Muestra la ruta de navegación actual de forma semántica y accesible,
 * permitiendo al usuario entender su ubicación en la jerarquía de la aplicación
 * y navegar hacia niveles superiores.
 *
 * @usageNotes
 * ### Uso básico
 * ```typescript
 * // En tu componente
 * breadcrumbItems: BreadcrumbItem[] = [
 *   { label: 'Inicio', url: '/' },
 *   { label: 'Grupos', url: '/grupos' },
 *   { label: 'Familia López' } // último elemento sin URL
 * ];
 * ```
 *
 * ```html
 * <app-breadcrumbs [items]="breadcrumbItems" />
 * ```
 *
 * ### Características
 * - Navegación semántica con `<nav>` y `<ol>`
 * - Totalmente accesible (WCAG 2.1)
 * - Responsive con scroll horizontal en móviles
 * - Integración con Angular Router
 * - Separadores visuales personalizables
 *
 * @see {@link BreadcrumbItem} para la estructura de cada elemento
 */
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  /**
   * Array de elementos que conforman la ruta de navegación.
   * El último elemento representa la página actual y no debe incluir URL.
   *
   * @example
   * ```typescript
   * items = [
   *   { label: 'Inicio', url: '/' },
   *   { label: 'Productos', url: '/productos' },
   *   { label: 'Electrónica' } // página actual
   * ];
   * ```
   */
  @Input() items: BreadcrumbItem[] = [];
}
