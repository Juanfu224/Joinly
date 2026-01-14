import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CardComponent, ButtonComponent, IconComponent, FormCheckboxComponent } from '../../../components/shared';

/**
 * Página de configuración de la cuenta.
 *
 * Permite al usuario gestionar preferencias de la aplicación.
 *
 * @usageNotes
 * Ruta: /usuario/configuracion
 */
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CardComponent, ButtonComponent, IconComponent, FormCheckboxComponent],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionComponent {
  protected readonly isSaving = signal(false);

  protected onSave(): void {
    this.isSaving.set(true);
    // TODO: Implementar guardado
    setTimeout(() => this.isSaving.set(false), 1000);
  }
}
