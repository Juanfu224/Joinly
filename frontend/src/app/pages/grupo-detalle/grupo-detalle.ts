import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, catchError, map } from 'rxjs';
import {
  ButtonComponent,
  MemberListComponent,
  type MemberData,
  EmptySubscriptionsComponent,
  SubscriptionCardComponent,
  IconComponent,
  PendingRequestsCardComponent,
} from '../../components/shared';
import type { UnidadFamiliar, MiembroUnidadResponse, SuscripcionSummary, SuscripcionCardData, GrupoCardData, SuscripcionResponse, SolicitudResponse } from '../../models';
import { type GrupoDetalleData, type ResolvedData } from '../../resolvers';
import { UnidadFamiliarService, SuscripcionService, ToastService, ModalService, SolicitudService, AuthService } from '../../services';

/**
 * Estado de navegación para mostrar datos optimistamente.
 */
interface GrupoNavigationState {
  grupoPreview?: GrupoCardData;
  nuevaSuscripcion?: SuscripcionResponse;
}

/**
 * Página Detalle de Grupo.
 * Datos precargados via grupoDetalleResolver.
 */
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
  ],
  templateUrl: './grupo-detalle.html',
  styleUrl: './grupo-detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrupoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly suscripcionService = inject(SuscripcionService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);

  /**
   * ID del grupo recibido desde la ruta mediante Router Input Binding.
   * Angular 21 best practice: usar input() en lugar de ActivatedRoute.
   */
  readonly id = input.required<string>();

  protected readonly grupo = signal<UnidadFamiliar | null>(null);
  protected readonly miembros = signal<MiembroUnidadResponse[]>([]);
  protected readonly suscripciones = signal<SuscripcionSummary[]>([]);
  protected readonly solicitudesPendientes = signal<SolicitudResponse[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  /** State de navegación capturado en el constructor (antes de que termine la navegación). */
  private readonly navigationState: GrupoNavigationState | undefined;

  constructor() {
    // Capturar state DURANTE la navegación (solo disponible en constructor)
    const nav = this.router.getCurrentNavigation();
    this.navigationState = nav?.extras?.state as GrupoNavigationState | undefined;

    // Preview optimista del grupo
    if (this.navigationState?.grupoPreview) {
      this.grupo.set({
        id: this.navigationState.grupoPreview.id,
        nombre: this.navigationState.grupoPreview.nombre,
        codigoInvitacion: '',
        administrador: { id: 0, nombreCompleto: '', email: '', nombreUsuario: '' },
        fechaCreacion: '',
        descripcion: null,
        maxMiembros: 0,
        estado: 'ACTIVO',
      });
    }
  }

  ngOnInit(): void {
    // Leer datos precargados por el resolver
    const resolved = this.route.snapshot.data['grupoData'] as ResolvedData<GrupoDetalleData>;

    if (resolved.error) {
      this.error.set(resolved.error);
      this.toastService.error(resolved.error);
    } else if (resolved.data) {
      this.grupo.set(resolved.data.grupo);
      this.miembros.set(resolved.data.miembros);
      this.suscripciones.set(resolved.data.suscripciones);

      // Actualización optimista: agregar suscripción recién creada

      // Cargar solicitudes pendientes si es admin
      if (this.isAdmin()) {
        this.cargarSolicitudesPendientes();
      }
      this.aplicarSuscripcionOptimista();
    }
  }

  /**
   * Aplica actualización optimista si hay una suscripción nueva en el state.
   * Transforma SuscripcionResponse a SuscripcionSummary y la agrega al inicio.
   */
  private aplicarSuscripcionOptimista(): void {
    if (!this.navigationState?.nuevaSuscripcion) return;

    const nueva = this.navigationState.nuevaSuscripcion;
    const suscripcionSummary: SuscripcionSummary = {
      id: nueva.id,
      nombreServicio: nueva.servicio.nombre,
      logoServicio: nueva.servicio.logo,
      precioPorPlaza: nueva.precioPorPlaza,
      fechaRenovacion: nueva.fechaRenovacion,
      periodicidad: nueva.periodicidad,
      estado: nueva.estado,
      numPlazasTotal: nueva.numPlazasTotal,
      plazasOcupadas: nueva.plazasOcupadas,
    };

    // Evitar duplicados (por si el resolver ya la trajo)
    const yaExiste = this.suscripciones().some((s) => s.id === nueva.id);
    if (!yaExiste) {
      this.suscripciones.update((current) => [suscripcionSummary, ...current]);
    }
  }

  // --- Computed ---
  protected readonly membersData = computed<MemberData[]>(() =>
    this.miembros().map((m) => ({
      id: m.id,
      nombreCompleto: m.usuario.nombreCompleto,
      nombreUsuario: m.usuario.nombreUsuario,
      email: m.usuario.email,
      avatar: m.usuario.avatar,
      rol: m.rol === 'ADMINISTRADOR' ? 'admin' : 'member',
    }))
  );

  protected readonly isAdmin = computed(() => {
    const grupoActual = this.grupo();
    const usuarioActual = this.authService.currentUser();
    if (!grupoActual || !usuarioActual) return false;
    // Verificar si el usuario actual es el administrador del grupo
    return grupoActual.administrador.id === usuarioActual.id;
  });

  protected readonly hasSolicitudesPendientes = computed(() => this.solicitudesPendientes().length > 0);

  protected readonly hasSuscripciones = computed(() => this.suscripciones().length > 0);

  protected readonly suscripcionCards = computed<SuscripcionCardData[]>(() =>
    this.suscripciones().map((s) => ({
      id: s.id,
      nombreServicio: s.nombreServicio,
      precioPorPlaza: s.precioPorPlaza,
      fechaRenovacion: s.fechaRenovacion,
      plazasOcupadas: s.plazasOcupadas,
      numPlazasTotal: s.numPlazasTotal,
      estado: s.estado,
    }))
  );


  /**
   * Recarga todos los datos del grupo.
   */
  private recargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      grupo: this.unidadService.getGrupoById(id),
      miembros: this.unidadService.getMiembrosGrupo(id),
      suscripciones: this.suscripcionService.getSuscripcionesGrupo(id).pipe(
        map((page) => page.content),
        catchError(() => of([] as SuscripcionSummary[]))
      ),
    }).subscribe({
      next: ({ grupo, miembros, suscripciones }) => {
        this.grupo.set(grupo);
        this.miembros.set(miembros);
        this.suscripciones.set(suscripciones);
        this.isLoading.set(false);
        
        // Cargar solicitudes si es admin
        if (this.isAdmin()) {
          this.cargarSolicitudesPendientes();
        }
      },
      error: () => {
        this.error.set('No se pudo cargar el grupo. Intenta de nuevo.');
        this.isLoading.set(false);
        // El errorInterceptor ya muestra el mensaje de error
      },
    });
  }

  /**
   * Carga las solicitudes pendientes del grupo
   */
  private cargarSolicitudesPendientes(): void {
    const grupoId = this.grupo()?.id;
    if (!grupoId) return;

    this.solicitudService.getSolicitudesPendientesGrupo(grupoId).subscribe({
      next: (solicitudes) => {
        this.solicitudesPendientes.set(solicitudes);
      },
      error: (error) => {
        // Manejar silenciosamente - puede ser que no haya solicitudes o no tenga permisos
        console.warn('No se pudieron cargar las solicitudes pendientes:', error);
        this.solicitudesPendientes.set([]);
      },
    });
  }

  /**
   * Maneja la aceptación de una solicitud
   */
  protected onAceptarSolicitud(solicitud: SolicitudResponse): void {
    this.modalService.open({
      title: '¿Aceptar solicitud?',
      content: `¿Estás seguro de que quieres aceptar la solicitud de <strong>${solicitud.solicitante.nombreCompleto}</strong> para unirse al grupo?`,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.solicitudService.aprobarSolicitud(solicitud.id).subscribe({
          next: () => {
            this.toastService.show('success', `Solicitud de ${solicitud.solicitante.nombreCompleto} aceptada`);
            // Recargar datos para mostrar el nuevo miembro
            const grupoId = Number(this.id());
            if (grupoId && !isNaN(grupoId)) {
              this.recargarDatos(grupoId);
            }
          },
          error: () => {
            // El errorInterceptor ya muestra el mensaje de error
          },
        });
      },
    });
  }

  /**
   * Maneja el rechazo de una solicitud
   */
  protected onRechazarSolicitud(solicitud: SolicitudResponse): void {
    this.modalService.open({
      title: '¿Rechazar solicitud?',
      content: `¿Estás seguro de que quieres rechazar la solicitud de <strong>${solicitud.solicitante.nombreCompleto}</strong>? Esta acción no se puede deshacer.`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.solicitudService.rechazarSolicitud(solicitud.id).subscribe({
          next: () => {
            this.toastService.show('info', `Solicitud de ${solicitud.solicitante.nombreCompleto} rechazada`);
            // Eliminar la solicitud de la lista
            this.solicitudesPendientes.update(solicitudes => 
              solicitudes.filter(s => s.id !== solicitud.id)
            );
          },
          error: () => {
            // El errorInterceptor ya muestra el mensaje de error
          },
        });
      },
    });
  }

  /**
   * Abre modal con el código de invitación.
   */
  protected onInvitar(): void {
    const codigo = this.grupo()?.codigoInvitacion;
    if (!codigo) return;

    this.modalService.openInviteModal(codigo);
  }

  /**
   * Navega a la página de crear suscripción.
   */
  protected onCrearSuscripcion(): void {
    const grupoId = this.grupo()?.id;
    if (grupoId) {
      this.router.navigate(['/grupos', grupoId, 'crear-suscripcion']);
    }
  }

  /**
   * Navega al detalle de la suscripción.
   */
  protected onSuscripcionClick(id: number): void {
    const grupoId = this.grupo()?.id;
    if (grupoId) {
      this.router.navigate(['/grupos', grupoId, 'suscripciones', id]);
    }
  }

  /**
   * Reintenta cargar los datos.
   */
  protected onReintentar(): void {
    const grupoId = Number(this.id());
    if (grupoId && !isNaN(grupoId)) {
      this.recargarDatos(grupoId);
    }
  }
}
