import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Componente Spinner Overlay - Indicador de carga global.
 *
 * Muestra un overlay semi-transparente con spinner centrado durante
 * operaciones async. Se renderiza condicionalmente desde el componente padre.
 *
 * **Características:**
 * - Bloquea interacción del usuario durante la carga
 * - Animación CSS pura (sin dependencias externas)
 * - Accesible: aria-busy, role="status", texto para screen readers
 * - Animaciones de entrada/salida suaves
 *
 * @usageNotes
 * ```html
 * <!-- En app.html (componente raíz) -->
 * @if (loadingService.isLoading()) {
 *   <app-spinner-overlay />
 * }
 * ```
 */
@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  templateUrl: './spinner-overlay.html',
  styleUrl: './spinner-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'status',
    'aria-live': 'polite',
    '[attr.aria-busy]': 'true',
  },
})
export class SpinnerOverlayComponent {}
