import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  GroupCardComponent,
  EmptyGroupsComponent,
} from '../../components/shared';
import { AuthService } from '../../services/auth';
import type { GrupoCardData } from '../../models/grupo.model';

/**
 * Página Dashboard - Vista principal de grupos del usuario autenticado.
 *
 * Muestra grid responsive de grupos familiares del usuario.
 * Protegida por authGuard - requiere autenticación.
 *
 * ### Características:
 * - Header con título + botón crear grupo
 * - Grid responsive usando group-card component
 * - Empty state cuando no hay grupos (empty-groups component)
 * - Mobile-First responsive
 *
 * ### Responsive:
 * - Mobile (320-767px): 1 columna, botón full-width
 * - Tablet (768-1023px): 2 columnas
 * - Desktop (1024px+): 3 columnas
 *
 * @usageNotes
 * Requiere autenticación. Protegida por authGuard.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonComponent, GroupCardComponent, EmptyGroupsComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Grupos del usuario (mock data).
   * En producción vendría de un GruposService.
   */
  protected readonly grupos = signal<GrupoCardData[]>([
    {
      id: 1,
      nombre: 'Familia García',
      totalMiembros: 6,
      suscripciones: 'Netflix, Spotify, Disney+',
    },
    {
      id: 2,
      nombre: 'Amigos del piso',
      totalMiembros: 4,
      suscripciones: 'HBO Max, Prime Video',
    },
    {
      id: 3,
      nombre: 'Compañeros de trabajo',
      totalMiembros: 3,
      suscripciones: null,
    },
  ]);

  /**
   * Usuario actual desde AuthService.
   */
  protected readonly currentUser = this.authService.currentUser;

  /**
   * Maneja el clic en el botón "Crear grupo".
   * En producción abrirá modal con CreateGroupFormComponent.
   */
  protected onCreateGroup(): void {
    // Mock: En desarrollo, redirige a página de creación cuando exista
    this.router.navigate(['/grupos/crear']);
  }

  /**
   * Maneja el evento de invitar miembros a un grupo.
   * En producción abrirá modal con formulario de invitación.
   */
  protected onGroupInvite(groupId: number): void {
    // Mock: En desarrollo, redirige a página de gestión cuando exista
    this.router.navigate(['/grupos', groupId, 'invitar']);
  }
}
