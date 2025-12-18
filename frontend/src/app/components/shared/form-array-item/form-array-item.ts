import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Componente contenedor genérico para items de FormArray.
 * 
 * **Características:**
 * - Content projection para máxima flexibilidad
 * - Botón de eliminación condicional
 * - Estilos consistentes con el sistema de diseño
 * - Accesibilidad integrada
 * 
 * @usageNotes
 * ```html
 * <app-form-array-item 
 *   [title]="'Credencial ' + (index + 1)"
 *   [canRemove]="items.length > 1"
 *   (removed)="removeItem(index)"
 * >
 *   <!-- Contenido del formulario -->
 *   <app-form-input ... />
 * </app-form-array-item>
 * ```
 */
@Component({
  selector: 'app-form-array-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './form-array-item.html',
  styleUrl: './form-array-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-array-item' },
})
export class FormArrayItemComponent {
  /** Título del item (ej: "Credencial 1") */
  readonly title = input<string>('');
  
  /** Controla si se muestra el botón de eliminar */
  readonly canRemove = input<boolean>(true);
  
  /** Evento emitido al hacer click en eliminar */
  readonly removed = output<void>();
  
  /** Computed para aria-label del botón eliminar */
  protected readonly removeButtonLabel = computed(() => 
    `Eliminar ${this.title()}`
  );
  
  protected onRemove(): void {
    if (this.canRemove()) {
      this.removed.emit();
    }
  }
}
