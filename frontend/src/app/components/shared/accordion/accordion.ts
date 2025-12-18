import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
} from '@angular/core';
import { AccordionItemComponent } from './accordion-item';

/**
 * Componente Accordion - Contenedor de items expandibles/colapsables.
 *
 * **Características:**
 * - Gestión automática de items mediante ContentChildren
 * - Modo múltiple (varios items abiertos) o individual (solo uno abierto)
 * - Totalmente accesible con ARIA y navegación por teclado
 * - Animaciones suaves de expansión/colapso
 * - OnPush change detection para rendimiento óptimo
 *
 * @usageNotes
 * ```html
 * <!-- Accordion básico (permite múltiples items abiertos) -->
 * <app-accordion>
 *   <app-accordion-item title="¿Qué es Joinly?">
 *     Joinly es una plataforma para gestionar suscripciones compartidas.
 *   </app-accordion-item>
 *   <app-accordion-item title="¿Cómo funciona?" [expanded]="true">
 *     Crea una unidad familiar y comparte los costos.
 *   </app-accordion-item>
 * </app-accordion>
 *
 * <!-- Accordion modo individual (solo un item abierto) -->
 * <app-accordion [allowMultiple]="false">
 *   <app-accordion-item title="Opción 1">
 *     Contenido 1
 *   </app-accordion-item>
 *   <app-accordion-item title="Opción 2">
 *     Contenido 2
 *   </app-accordion-item>
 * </app-accordion>
 * ```
 *
 * @remarks
 * El componente padre detecta automáticamente los items hijos mediante
 * ContentChildren. Cuando allowMultiple es false, cierra automáticamente
 * otros items al abrir uno nuevo.
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  template: '<ng-content />',
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent implements AfterContentInit {
  /**
   * Permite que múltiples items estén abiertos simultáneamente.
   * Si es false, abrir un item cierra automáticamente los demás.
   * @default true
   */
  allowMultiple = input<boolean>(true);

  /**
   * Referencia a todos los items del accordion (detectados automáticamente)
   */
  protected readonly items = contentChildren(AccordionItemComponent);

  ngAfterContentInit(): void {
    // Registrar este accordion como padre de cada item
    this.items().forEach((item) => {
      item.registerParent(this);
    });
  }

  /**
   * Notifica cuando un item es expandido.
   * Si allowMultiple es false, colapsa todos los demás items.
   * 
   * @param expandedItem - El item que acaba de expandirse
   */
  onItemExpanded(expandedItem: AccordionItemComponent): void {
    if (!this.allowMultiple()) {
      // Colapsar todos los items excepto el que se acaba de expandir
      this.items().forEach((item) => {
        if (item !== expandedItem && item.isExpanded()) {
          item.collapse();
        }
      });
    }
  }
}
