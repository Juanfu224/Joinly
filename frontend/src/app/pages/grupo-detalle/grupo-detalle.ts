import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  MiembroUnidadResponse,
  SuscripcionSummary,
  SuscripcionCardData,
  GrupoCardData,
  SolicitudResponse,
  EstadoSuscripcion,
  Periodicidad,
} from '../../models';
import { type GrupoDetalleData, type ResolvedData } from '../../resolvers';
import { ToastService, ModalService, AuthService } from '../../services';
import { GruposStore, SuscripcionesStore, SolicitudesStore } from '../../stores';
import {
  ButtonComponent,
  MemberListComponent,
  type MemberData,
  EmptySubscriptionsComponent,
  SubscriptionCardComponent,
  IconComponent,
  PendingRequestsCardComponent,
  PaginationComponent,
} from '../../components/shared';
import { InfiniteScrollDirective } from '../../directives';

interface GrupoNavigationState {
  grupoPreview?: GrupoCardData;
}

@Component({
  selector: 'app-grupo-detalle',
  standalone: true,
  imports: [
    ButtonComponent,
    MemberListComponent,
    EmptySubscriptionsComponent,
    SubscriptionCardComponent,
    IconComponent,
    PendingRequestsCardComponent,
    PaginationComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './grupo-detalle.html',
  styleUrl: './grupo-detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrupoDetalleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);
  private readonly gruposStore = inject(GruposStore);
  private readonly suscripcionesStore = inject(SuscripcionesStore);
  private readonly solicitudesStore = inject(SolicitudesStore);

  readonly id = input.required<string>();

  protected readonly grupo = computed(() => this.gruposStore.getGrupoById(Number(this.id())));
  protected readonly miembros = signal<MiembroUnidadResponse[]>([]);
  protected readonly suscripciones = this.suscripcionesStore.suscripciones;
  protected readonly suscripcionesFiltradas = this.suscripcionesStore.suscripcionesFiltradas;
  protected readonly suscripcionesPaginadas = this.suscripcionesStore.suscripcionesPaginadas;
  protected readonly solicitudesPendientes = this.solicitudesStore.pendientesGrupo;
  protected readonly solicitudesPendientesVisible = this.solicitudesStore.pendientesGrupoVisible;
  protected readonly isLoading = computed(
    () => this.suscripcionesStore.loading() || this.solicitudesStore.loadingPendientesGrupo(),
  );
  protected readonly error = computed(() => this.suscripcionesStore.error());

  protected readonly estadosFiltro = this.suscripcionesStore.estadosFiltro;
  protected readonly periodicidadFiltro = this.suscripcionesStore.periodicidadFiltro;
  protected readonly hasFiltrosActivos = computed(
    () => this.estadosFiltro().length > 0 || this.periodicidadFiltro() !== null,
  );

  protected readonly ESTADOS = ['ACTIVA', 'PAUSADA', 'CANCELADA', 'EXPIRADA'] as const;
  protected readonly PERIODICIDADES = ['MENSUAL', 'TRIMESTRAL', 'ANUAL'] as const;

  private readonly navigationState: GrupoNavigationState | undefined;

  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.navigationState = nav?.extras?.state as GrupoNavigationState | undefined;
  }

  async ngOnInit(): Promise<void> {
    const resolved = this.route.snapshot.data['grupoData'] as ResolvedData<GrupoDetalleData>;

    if (resolved.error) {
      this.toastService.error(resolved.error);
    } else if (resolved.data) {
      this.miembros.set(resolved.data.miembros);

      const grupoId = Number(this.id());
      if (!isNaN(grupoId)) {
        await Promise.all([
          this.suscripcionesStore.loadByUnidad(grupoId),
          this.solicitudesStore.loadPendientesGrupo(grupoId),
        ]);
      }
    }
  }

  protected readonly membersData = computed<MemberData[]>(() =>
    this.miembros().map((m) => ({
      id: m.id,
      nombreCompleto: m.usuario.nombreCompleto,
      nombreUsuario: m.usuario.nombreUsuario,
      email: m.usuario.email,
      avatar: m.usuario.avatar,
      rol: m.rol === 'ADMINISTRADOR' ? 'admin' : 'member',
    })),
  );

  protected readonly isAdmin = computed(() => {
    const grupoActual = this.grupo();
    const usuarioActual = this.authService.currentUser();
    if (!grupoActual || !usuarioActual) return false;
    return grupoActual.administrador.id === usuarioActual.id;
  });

  protected readonly hasSolicitudesPendientes = computed(
    () => this.solicitudesPendientes().length > 0,
  );

  protected readonly hasSuscripciones = computed(() => this.suscripciones().length > 0);
  protected readonly hasSuscripcionesFiltradas = computed(
    () => this.suscripcionesFiltradas().length > 0,
  );
  protected readonly noFilterResults = computed(
    () => this.hasFiltrosActivos() && !this.hasSuscripcionesFiltradas() && this.hasSuscripciones(),
  );
  protected readonly paginationInfo = computed(() => ({
    currentPage: this.suscripcionesStore.page(),
    totalItems: this.suscripcionesFiltradas().length,
    pageSize: this.suscripcionesStore.pageSize(),
  }));
  protected readonly hasMoreSolicitudes = this.solicitudesStore.hasMorePendientesGrupo;
  protected readonly loadingMoreSolicitudes = this.solicitudesStore.loadingMorePendientesGrupo;
  protected readonly suscripcionesPageSize = this.suscripcionesStore.pageSize;

  protected readonly suscripcionesFiltradasCards = computed<SuscripcionCardData[]>(() =>
    this.suscripcionesFiltradas().map((s) => ({
      id: s.id,
      nombreServicio: s.nombreServicio,
      precioPorPlaza: s.precioPorPlaza,
      fechaRenovacion: s.fechaRenovacion,
      plazasOcupadas: s.plazasOcupadas,
      numPlazasTotal: s.numPlazasTotal,
      estado: s.estado,
      periodicidad: s.periodicidad,
    })),
  );

  protected toggleEstadoFiltro(estado: EstadoSuscripcion): void {
    this.suscripcionesStore.toggleEstadoFiltro(estado);
  }

  protected onPeriodicidadChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.suscripcionesStore.setPeriodicidadFiltro(value ? (value as Periodicidad) : null);
  }

  protected clearFiltros(): void {
    this.suscripcionesStore.clearFiltros();
  }

  protected async onPageChange(page: number): Promise<void> {
    await this.suscripcionesStore.goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected async onLoadMoreSolicitudes(): Promise<void> {
    await this.solicitudesStore.loadMorePendientesGrupo();
  }

  protected trackBySuscripcionId(index: number, suscripcion: SuscripcionCardData): number {
    return suscripcion.id;
  }

  protected trackBySolicitudId(index: number, solicitud: SolicitudResponse): number {
    return solicitud.id;
  }

  private async recargarDatos(id: number): Promise<void> {
    try {
      await this.gruposStore.refresh();
      await this.suscripcionesStore.refresh();
      await this.solicitudesStore.refreshPendientesGrupo();
    } catch (error) {
      this.toastService.error('Error al recargar los datos');
    }
  }

  protected async onAceptarSolicitud(solicitud: SolicitudResponse): Promise<void> {
    try {
      await this.solicitudesStore.aprobar(solicitud.id);
    } catch (error) {
      const nombreSolicitante = solicitud.solicitante?.nombreCompleto || 'Usuario';
      this.toastService.error(`Error al aceptar la solicitud de ${nombreSolicitante}`);
    }
  }

  protected async onRechazarSolicitud(solicitud: SolicitudResponse): Promise<void> {
    this.modalService.open({
      title: '¿Rechazar solicitud?',
      content: `¿Estás seguro de que quieres rechazar la solicitud de <strong>${solicitud.solicitante.nombreCompleto}</strong>? Esta acción no se puede deshacer.`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await this.solicitudesStore.rechazar(solicitud.id);
        } catch (error) {
          this.toastService.error('Error al rechazar la solicitud');
        }
      },
    });
  }

  protected onInvitar(): void {
    const grupo = this.grupo();
    if (!grupo) return;

    this.modalService.openInviteModal(grupo.codigoInvitacion);
  }

  protected onCrearSuscripcion(): void {
    const grupoId = this.grupo()?.id;
    if (grupoId) {
      this.router.navigate(['/grupos', grupoId, 'crear-suscripcion']);
    }
  }

  protected onSuscripcionClick(id: number): void {
    const grupoId = this.grupo()?.id;
    if (grupoId) {
      this.router.navigate(['/grupos', grupoId, 'suscripciones', id]);
    }
  }

  protected async onReintentar(): Promise<void> {
    const grupoId = Number(this.id());
    if (grupoId && !isNaN(grupoId)) {
      await this.recargarDatos(grupoId);
    }
  }

  ngOnDestroy(): void {
    this.suscripcionesStore.clearFiltros();
  }
}
