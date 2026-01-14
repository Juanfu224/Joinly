import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de Política de Privacidad.
 *
 * @usageNotes
 * Ruta: /privacidad
 */
@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './privacidad.html',
  styleUrl: './legal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacidadComponent {}
