import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de Términos y Condiciones.
 *
 * @usageNotes
 * Ruta: /terminos
 */
@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terminos.html',
  styleUrl: './legal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminosComponent {}
