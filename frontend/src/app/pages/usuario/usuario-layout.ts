import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent, BreadcrumbsComponent, type BreadcrumbItem } from '../../components/shared';

/**
 * Layout para el área de usuario con navegación lateral.
 *
 * Proporciona una estructura consistente para todas las páginas
 * relacionadas con el perfil y configuración del usuario.
 *
 * @usageNotes
 * Ruta padre: /usuario
 * Rutas hijas: /usuario/perfil, /usuario/configuracion, /usuario/notificaciones
 *
 * @remarks
 * - Navegación con tabs/sidebar responsive
 * - Router outlet para renderizar páginas hijas
 * - Breadcrumbs dinámicos
 */
@Component({
  selector: 'app-usuario-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './usuario-layout.html',
  styleUrl: './usuario-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioLayoutComponent {
  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', url: '/dashboard' },
    { label: 'Mi cuenta' },
  ];
}
