import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Componente de contenido principal de la aplicación.
 * Utiliza la etiqueta semántica <main> y proyecta el contenido de las páginas.
 *
 * @usageNotes
 * ```html
 * <app-main>
 *   <router-outlet />
 * </app-main>
 * ```
 */
@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.html',
  styleUrl: './main.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {}
