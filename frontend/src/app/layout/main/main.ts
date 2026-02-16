import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Componente wrapper de contenido principal.
 *
 * NOTA: El landmark semántico `<main>` y el foco programático
 * están gestionados directamente en `app.html` para garantizar
 * un único `<main>` por página (WCAG 1.3.1).
 *
 * Este componente se puede usar como contenedor de estilos
 * para el contenido proyectado.
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
