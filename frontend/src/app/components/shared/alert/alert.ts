import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-paths';

type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Componente de alerta estático para feedback inline.
 *
 * Uso: mensajes de confirmación, errores en formularios, advertencias,
 * información contextual en páginas.
 *
 * Diferencia con Toasts:
 * - Alerts: Estáticos, en la página, permanecen hasta que se cierran manualmente
 * - Toasts: Temporales, en esquina de pantalla, desaparecen automáticamente
 *
 * @usageNotes
 * ```html
 * <app-alert type="success">
 *   <strong>¡Éxito!</strong> La operación se completó correctamente.
 * </app-alert>
 *
 * <app-alert type="error" [dismissible]="true">
 *   <strong>Error:</strong> El correo ya está registrado.
 * </app-alert>
 * ```
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    'aria-live': 'polite',
  },
})
export class AlertComponent {
  /**
   * Tipo de alerta que determina el color y el icono
   * - success: Verde para confirmaciones
   * - error: Rojo para errores
   * - warning: Naranja para advertencias
   * - info: Azul para información
   */
  type = input<AlertType>('info');

  /**
   * Si es true, muestra un botón X para cerrar la alerta
   */
  dismissible = input<boolean>(false);

  /**
   * ID personalizado para la alerta (para accesibilidad)
   */
  alertId = input<string>('');

  /**
   * Evento emitido cuando se cierra la alerta
   */
  close = output<void>();

  /**
   * Mapeo de tipos de alerta a iconos
   */
  private readonly iconMap: Record<AlertType, IconName> = {
    success: 'circle-check',
    error: 'circle-x',
    warning: 'alert-triangle',
    info: 'info',
  };

  /**
   * ID computado para accesibilidad (genera uno si no se proporciona)
   */
  protected computedId = computed(
    () => this.alertId() || `alert-${Math.random().toString(36).substr(2, 9)}`,
  );

  /**
   * Icono correspondiente al tipo de alerta
   */
  protected icon = computed<IconName>(() => this.iconMap[this.type()]);

  /**
   * Maneja el cierre de la alerta
   */
  protected onClose(): void {
    this.close.emit();
  }
}
