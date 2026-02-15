import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de Declaración de Accesibilidad.
 *
 * @usageNotes
 * Ruta: /accesibilidad
 */
@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './accesibilidad.html',
  styleUrl: './legal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesibilidadComponent {}
