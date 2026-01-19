import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme';
import { IconComponent } from '../icon/icon';

/**
 * Componente para alternar entre tema claro y oscuro.
 *
 * Proporciona un botón accesible que:
 * - Muestra el icono de sol (tema claro) o luna (tema oscuro)
 * - Cambia el tema al hacer clic
 * - Guarda preferencia en localStorage
 * - Incluye atributos ARIA para accesibilidad
 * - Se integra con ThemeService usando signals
 *
 * @usageNotes
 * ```html
 * <app-theme-toggle />
 * ```
 *
 * @remarks
 * - Usa ChangeDetectionStrategy.OnPush para optimización
 * - El icono cambia reactivamente gracias a signals
 * - Incluye transiciones suaves definidas en CSS
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  /**
   * Signal reactivo que expone el tema actual.
   * Se actualiza automáticamente cuando cambia el tema.
   */
  protected readonly currentTheme = this.themeService.currentTheme;

  /**
   * Alterna entre tema claro y oscuro.
   * La preferencia se guarda automáticamente en localStorage.
   */
  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
