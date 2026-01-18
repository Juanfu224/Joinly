import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../components/shared';

/**
 * Layout para el área de usuario con navegación lateral.
 * Rutas hijas: /usuario/perfil, /usuario/configuracion, /usuario/notificaciones, /usuario/solicitudes
 */
@Component({
  selector: 'app-usuario-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './usuario-layout.html',
  styleUrl: './usuario-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioLayoutComponent {}
