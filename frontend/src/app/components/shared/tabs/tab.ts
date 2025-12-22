import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { generateShortId } from '../../../utils/uuid';

/**
 * Componente Tab - Panel de contenido individual dentro de un sistema de pestañas.
 *
 * **Características:**
 * - Signal para controlar visibilidad del contenido
 * - Transiciones CSS suaves (fade in/out)
 * - Atributos ARIA completos para accesibilidad
 * - IDs únicos generados automáticamente
 *
 * @usageNotes
 * ```html
 * <!-- Tab básico -->
 * <app-tab title="General">
 *   Contenido del tab general
 * </app-tab>
 *
 * <!-- Múltiples tabs dentro de un contenedor -->
 * <app-tabs>
 *   <app-tab title="Perfil">Contenido del perfil</app-tab>
 *   <app-tab title="Seguridad">Configuración de seguridad</app-tab>
 * </app-tabs>
 * ```
 *
 * @remarks
 * Este componente NO debe usarse de forma independiente. Debe estar
 * siempre dentro de un componente `<app-tabs>` que gestiona su estado.
 * 
 * El estado activo se controla mediante el signal `isActive`, que es
 * modificado por el componente padre TabsComponent cuando el usuario
 * selecciona una pestaña diferente.
 */
@Component({
  selector: 'app-tab',
  standalone: true,
  templateUrl: './tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  /**
   * Título del tab (mostrado en la pestaña clickeable)
   */
  readonly title = input.required<string>();

  /**
   * Signal que indica si este tab está activo actualmente.
   * Controlado internamente por el componente padre TabsComponent.
   */
  readonly isActive = signal<boolean>(false);

  /**
   * IDs únicos para vinculación ARIA entre tab y panel.
   * Generados automáticamente para garantizar unicidad.
   */
  readonly tabId = generateShortId('tab');
  readonly panelId = generateShortId('tabpanel');

  /**
   * Activa este tab (llamado por el componente padre Tabs)
   */
  activate(): void {
    this.isActive.set(true);
  }

  /**
   * Desactiva este tab (llamado por el componente padre Tabs)
   */
  deactivate(): void {
    this.isActive.set(false);
  }
}
