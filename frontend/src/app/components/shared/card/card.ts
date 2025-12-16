import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type CardVariant = 'feature' | 'action' | 'info' | 'list';

/**
 * Componente de tarjeta reutilizable con múltiples variantes.
 *
 * @usageNotes
 * ```html
 * <!-- Card de característica con icono, título y descripción -->
 * <app-card variant="feature">
 *   <div slot="icon">🏠</div>
 *   <h3 slot="title">Grupos familiares</h3>
 *   <p slot="description">Crea unidades familiares...</p>
 * </app-card>
 *
 * <!-- Card de acción horizontal -->
 * <app-card variant="action">
 *   <div slot="icon">➕</div>
 *   <h3 slot="title">Crear unidad familiar</h3>
 *   <p slot="description">Empieza un nuevo grupo</p>
 * </app-card>
 *
 * <!-- Card de información -->
 * <app-card variant="info">
 *   <div slot="icon">📅</div>
 *   <h4 slot="title">Renovación</h4>
 *   <p slot="value">1 de Enero de 2026</p>
 * </app-card>
 *
 * <!-- Card de lista con metadata y botón -->
 * <app-card variant="list">
 *   <h3 slot="title">Nombre suscripción</h3>
 *   <p slot="metadata">0.00€ · Renueva el 00/00/00</p>
 *   <span slot="badge">👥 0</span>
 *   <button slot="action">Disponible</button>
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
   */
  variant = input<CardVariant>('feature');

  /**
   * Desactiva el efecto hover (útil para cards no interactivas)
   */
  disableHover = input<boolean>(false);

  /**
   * Clases CSS computadas basadas en las propiedades
   */
  cardClasses = computed(() => {
    const classes = [
      'c-card',
      `c-card--${this.variant()}`,
    ];

    if (this.disableHover()) {
      classes.push('c-card--no-hover');
    }

    return classes.join(' ');
  });
}
