import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent, GroupCardComponent, EmptyGroupsComponent, IconComponent } from '../../components/shared';
import type { GrupoCardData } from '../../models';
import { type DashboardData, type ResolvedData } from '../../resolvers';
import { AuthService, UnidadFamiliarService, ToastService, ModalService } from '../../services';

/**
 * Dashboard - Vista principal de grupos del usuario autenticado.
 * Datos precargados via dashboardResolver.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent, GroupCardComponent, EmptyGroupsComponent, IconComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly grupos = signal<GrupoCardData[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['dashboardData'] as ResolvedData<DashboardData>;

    if (resolved.error) {
      this.error.set(resolved.error);
      this.toastService.error(resolved.error);
    } else if (resolved.data) {
      this.grupos.set(resolved.data.grupos);
    }
  }

  /** Recarga grupos desde la API */
  protected recargarGrupos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.unidadService.getGruposCards().subscribe({
      next: (page) => {
        this.grupos.set(page.content);
        this.isLoading.set(false);
      },
      error: () => {
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
   * Busca el código de invitación y abre el modal.
   */
  protected onGroupInvite(groupId: number): void {
    // Obtener el grupo para acceder a su código de invitación
    this.unidadService.getGrupoById(groupId).subscribe({
      next: (grupo) => {
        this.modalService.openInviteModal(grupo.codigoInvitacion);
      },
      error: () => {
        this.toastService.error('No se pudo obtener el código de invitación');
      },
    });
  }

  /**
   * Navega al detalle del grupo con state para UX optimizada.
   * Pasa datos en state para mostrar instantáneamente mientras carga la API.
   */
  protected onGroupClick(groupId: number, groupData?: GrupoCardData): void {
    this.router.navigate(['/grupos', groupId], {
      state: { grupoPreview: groupData },
    });
  }
}
