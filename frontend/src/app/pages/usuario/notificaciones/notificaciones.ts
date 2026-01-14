import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CardComponent, ButtonComponent, IconComponent, FormCheckboxComponent } from '../../../components/shared';

/**
 * Página de preferencias de notificaciones.
 *
 * Permite al usuario configurar qué notificaciones desea recibir.
 *
 * @usageNotes
 * Ruta: /usuario/notificaciones
 */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CardComponent, ButtonComponent, IconComponent, FormCheckboxComponent],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionesComponent {
  protected readonly isSaving = signal(false);

  protected onSave(): void {
    this.isSaving.set(true);
    // TODO: Implementar guardado
    setTimeout(() => this.isSaving.set(false), 1000);
  }
}
