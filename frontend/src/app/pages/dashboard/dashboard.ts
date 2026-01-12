import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  BreadcrumbsComponent,
  type BreadcrumbItem,
  CardComponent,
  GroupCardComponent,
  EmptyGroupsComponent,
  IconComponent,
} from '../../components/shared';
import type { GrupoCardData } from '../../models';
import { AuthService } from '../../services';

/**
 * Página Dashboard - Vista principal de grupos del usuario autenticado.
 *
 * Muestra grid responsive de grupos familiares del usuario.
 * Protegida por authGuard - requiere autenticación.
 *
 * ### Características:
 * - Breadcrumbs de navegación
 * - Tarjetas de acción: Crear grupo / Unirse a grupo
 * - Grid responsive usando group-card component
 * - Empty state cuando no hay grupos (empty-groups component)
 * - Mobile-First responsive
 *
 * ### Responsive:
 * - Mobile (320-767px): 1 columna, tarjetas apiladas
 * - Tablet (768-1023px): 2 columnas
 * - Desktop (1024px+): 3 columnas
 *
 * @usageNotes
 * Requiere autenticación. Protegida por authGuard.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BreadcrumbsComponent, CardComponent, GroupCardComponent, EmptyGroupsComponent, IconComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Breadcrumbs de navegación
   */
  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', url: '/dashboard' },
    { label: 'Grupos' },
  ];

  /**
   * Grupos del usuario (mock data).
   * En producción vendría de un GruposService.
   */
  protected readonly grupos = signal<GrupoCardData[]>([
    {
      id: 1,
      nombre: 'Familia López',
      totalMiembros: 1,
      suscripciones: 'Ninguna',
    },
  ]);

  /**
   * Usuario actual desde AuthService.
   */
  protected readonly currentUser = this.authService.currentUser;

  /**
   * Navega a la página de crear grupo.
   */
  protected onCreateGroup(): void {
    this.router.navigate(['/crear-grupo']);
  }

  /**
   * Navega a la página de unirse a grupo.
   */
  protected onJoinGroup(): void {
    this.router.navigate(['/unirse-grupo']);
  }

  /**
   * Maneja el evento de invitar miembros a un grupo.
   */
  protected onGroupInvite(groupId: number): void {
    this.router.navigate(['/grupos', groupId, 'invitar']);
  }
}
