import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type CardVariant = 'feature' | 'action' | 'info' | 'list' | 'content';

/**
 * Componente de tarjeta reutilizable con múltiples variantes.
 *
 * **Características:**
 * - Standalone component (Angular 21)
 * - OnPush change detection para rendimiento óptimo
 * - Uso de signals para reactividad
 * - Content projection con ng-content para máxima flexibilidad
 * - Implementa BEM para estilos consistentes
 * - Usa elemento semántico `<article>` para accesibilidad
 *
 * @usageNotes
 * ```html
 * <!-- Card de característica con icono, título y descripción -->
 * <app-card variant="feature">
 *   <div slot="icon" class="c-card-icon c-card-icon--amarillo">
 *     <app-icon name="users" />
 *   </div>
 *   <h4 slot="title">Grupos familiares</h4>
 *   <p slot="description">Crea unidades familiares...</p>
 * </app-card>
 *
 * <!-- Card de acción horizontal -->
 * <app-card variant="action">
 *   <div slot="icon" class="c-card-icon c-card-icon--naranja">
 *     <app-icon name="add" />
 *   </div>
 *   <h4 slot="title">Crear unidad familiar</h4>
 *   <p slot="description">Empieza un nuevo grupo</p>
 * </app-card>
 *
 * <!-- Card de información -->
 * <app-card variant="info">
 *   <div slot="icon" class="c-card-icon c-card-icon--naranja">
 *     <app-icon name="calendar" />
 *   </div>
 *   <h4 slot="title">Renovación</h4>
 *   <p slot="value">1 de Enero de 2026</p>
 * </app-card>
 *
 * <!-- Card de lista con metadata y botón -->
 * <app-card variant="list">
 *   <h4 slot="title">Netflix Premium</h4>
 *   <p slot="metadata">4,25€ · Renueva el 15/01/26</p>
 *   <span slot="badge" class="c-card-badge">
 *     <app-icon name="user" size="sm" />
 *     4
 *   </span>
 *   <app-button slot="action" variant="purple" size="sm">Disponible</app-button>
 * </app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrls: ['./card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  /**
   * Variante visual de la tarjeta
   * - feature: Card vertical con icono, título y descripción (características)
   * - action: Card horizontal con icono y texto (acciones rápidas)
   * - info: Card horizontal compacta con icono, título y valor
   * - list: Card de lista con título, metadata, badge y botón
   * - content: Card contenedor para contenido libre sin slots
   */
  variant = input<CardVariant>('content');

  /**
   * Desactiva el efecto hover (útil para cards no interactivas)
   */
  disableHover = input<boolean>(false);

  /**
   * Aplica fondo gris claro en lugar de blanco
   */
  fondoGris = input<boolean>(false);

  /**
   * Clases CSS computadas basadas en las propiedades
   */
  cardClasses = computed(() => {
    const classes = ['c-card', `c-card--${this.variant()}`];

    if (this.disableHover()) {
      classes.push('c-card--no-hover');
    }

    if (this.fondoGris()) {
      classes.push('c-card--fondo-gris');
    }

    return classes.join(' ');
  });
}
