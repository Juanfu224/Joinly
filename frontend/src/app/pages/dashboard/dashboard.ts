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
import { AuthService, ModalService } from '../../services';

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
  private readonly modalService = inject(ModalService);
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
  protected readonly grupos = signal<GrupoCardData[]>([]);

  /**
   * Usuario actual desde AuthService.
   */
  protected readonly currentUser = this.authService.currentUser;

  /**
   * Abre modal para crear un nuevo grupo.
   */
  protected onCreateGroup(): void {
    this.modalService.open({
      title: 'Crear unidad familiar',
      content: 'Funcionalidad en desarrollo. Pronto podrás crear grupos.',
      confirmText: 'Entendido',
    });
  }

  /**
   * Abre modal para unirse a un grupo existente.
   */
  protected onJoinGroup(): void {
    this.modalService.open({
      title: 'Unirse a un grupo',
      content: 'Funcionalidad en desarrollo. Pronto podrás unirte a grupos con código.',
      confirmText: 'Entendido',
    });
  }

  /**
   * Maneja el evento de invitar miembros a un grupo.
   */
  protected onGroupInvite(groupId: number): void {
    this.router.navigate(['/grupos', groupId, 'invitar']);
  }
}
