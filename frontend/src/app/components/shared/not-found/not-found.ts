import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';

/**
 * Componente NotFound - Página 404 profesional.
 *
 * Muestra una página de error 404 cuando el usuario accede a una ruta
 * que no existe en la aplicación. Diseñada siguiendo las guías de UX
 * y accesibilidad WCAG 2.1 AA.
 *
 * @usageNotes
 * Se usa automáticamente cuando ninguna ruta coincide (wildcard **).
 *
 * @remarks
 * - Diseño responsive Mobile-First
 * - Accesible con roles ARIA apropiados
 * - Mensaje claro y accionable
 * - Enlace de vuelta al dashboard o inicio
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
