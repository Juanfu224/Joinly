import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { AuthService, UnidadFamiliarService, ToastService } from '../../services';

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
 * - Carga de datos desde API con estados de loading/error
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
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  /**
   * Breadcrumbs de navegación
   */
  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', url: '/dashboard' },
    { label: 'Grupos' },
  ];

  /**
   * Grupos del usuario cargados desde la API
   */
  protected readonly grupos = signal<GrupoCardData[]>([]);

  /**
   * Estado de carga
   */
  protected readonly isLoading = signal(true);

  /**
   * Error al cargar los grupos
   */
  protected readonly error = signal<string | null>(null);

  /**
   * Usuario actual desde AuthService.
   */
  protected readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.cargarGrupos();
  }

  /**
   * Carga los grupos del usuario desde la API.
   */
  protected cargarGrupos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.unidadService.getGruposCards().subscribe({
      next: (page) => {
        this.grupos.set(page.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.error.set('No se pudieron cargar los grupos. Intenta de nuevo.');
        this.isLoading.set(false);
        this.toastService.error('Error al cargar los grupos');
      },
    });
  }

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
