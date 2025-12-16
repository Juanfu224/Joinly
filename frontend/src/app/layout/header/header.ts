import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente de cabecera principal de la aplicación.
 * Contiene el logotipo y área de utilidad con botones de acceso.
 *
 * @remarks
 * El logotipo soporta variantes de color mediante modificadores BEM:
 * - `.c-header__logo` (predeterminado): Texto oscuro + acento naranja oscuro (#ea580c)
 * - `.c-header__logo--claro-naranja`: Texto claro + acento naranja (#f97316)
 * - `.c-header__logo--morado`: Texto oscuro + acento morado oscuro (#7c3aed)
 * - `.c-header__logo--claro-morado`: Texto claro + acento morado (#9333ea)
 * - `.c-header__logo--azul`: Texto oscuro + acento azul (#60a5fa)
 * - `.c-header__logo--amarillo`: Texto oscuro + acento amarillo (#facc15)
 *
 * @usageNotes
 * ```html
 * <app-header />
 * ```
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
