import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente de pie de página de la aplicación.
 * Contiene enlaces legales, redes sociales y copyright.
 *
 * @usageNotes
 * ```html
 * <app-footer />
 * ```
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  /** Año actual para el copyright */
  protected readonly anioActual = new Date().getFullYear();
}
