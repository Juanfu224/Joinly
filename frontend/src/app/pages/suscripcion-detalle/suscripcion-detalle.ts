import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  SubscriptionStatCardComponent,
  MemberListComponent,
  SubscriptionInfoCardComponent,
  IconComponent,
  ButtonComponent,
  type MemberData,
  type SubscriptionInfoData,
  type StatCardType,
  type JoinRequest,
} from '../../components/shared';
import type { SuscripcionDetalle, SolicitudResponse } from '../../models';
import { type ResolvedData } from '../../resolvers';
import { ToastService, AuthService, ModalService } from '../../services';
import { SuscripcionesStore, SolicitudesStore } from '../../stores';

@Component({
  selector: 'app-suscripcion-detalle',
  standalone: true,
  imports: [
    SubscriptionStatCardComponent,
    MemberListComponent,
    SubscriptionInfoCardComponent,
    IconComponent,
    ButtonComponent,
  ],
  templateUrl: './suscripcion-detalle.html',
  styleUrl: './suscripcion-detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuscripcionDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly suscripcionesStore = inject(SuscripcionesStore);
  private readonly solicitudesStore = inject(SolicitudesStore);

  readonly id = input.required<string>();
  readonly grupoId = input.required<string>();

  protected readonly suscripcion = this.suscripcionesStore.detalle;
  protected readonly isLoading = this.suscripcionesStore.loadingDetalle;
  protected readonly error = computed(() => this.suscripcionesStore.error());
  protected readonly tieneSolicitudPendiente = signal(false);
  protected readonly solicitudesPendientes = this.solicitudesStore.pendientesSuscripcion;

  protected readonly esAnfitrion = computed(() => {
    const sub = this.suscripcion();
    const currentUser = this.authService.currentUser();
    if (!sub || !currentUser) return false;
    return sub.anfitrion.id === currentUser.id;
  });

  protected readonly esMiembro = computed(() => {
    const sub = this.suscripcion();
    const currentUser = this.authService.currentUser();
    if (!sub || !currentUser) return false;
    return sub.miembros.some((m) => m.usuario.id === currentUser.id);
  });

  protected readonly estaCompleta = computed(() => {
    const sub = this.suscripcion();
    if (!sub) return false;
    return sub.plazasDisponibles === 0;
  });

  protected readonly puedeSolicitarPlaza = computed(() => {
    const sub = this.suscripcion();
    if (!sub) return false;
    if (this.esAnfitrion() || this.esMiembro()) return false;
    if (sub.plazasDisponibles === 0) return false;
    if (this.tieneSolicitudPendiente()) return false;
    if (sub.estado !== 'ACTIVA') return false;
    return true;
  });

  async ngOnInit(): Promise<void> {
    const resolved = this.route.snapshot.data[
      'suscripcionData'
    ] as ResolvedData<SuscripcionDetalle>;
    const subId = Number(this.id());

    if (resolved.error) {
      // Solo mostrar error si hay mensaje (no si fue timeout)
      if (resolved.error.trim()) {
        this.toastService.error(resolved.error);
        return;
      }
    }

    // Cargar datos (el store maneja el caché)
    if (!isNaN(subId)) {
      // Cargar en paralelo sin await para no bloquear UI, con manejo de errores
      Promise.all([
        this.suscripcionesStore.loadDetalle(subId),
        this.solicitudesStore.loadPendientesSuscripcion(subId),
      ])
        .then(async () => {
          const tienePendiente =
            await this.solicitudesStore.tieneSolicitudPendienteSuscripcion(subId);
          this.tieneSolicitudPendiente.set(tienePendiente);
        })
        .catch((error) => {
          console.error('Error al cargar datos de la suscripción:', error);
        });
    }
  }

  protected readonly tituloSuscripcion = computed(() => this.suscripcion()?.servicio.nombre ?? '');

  protected readonly descripcionSuscripcion = computed(
    () => 'Gestiona la suscripción con tu familia y ahorra',
  );

  protected readonly nombreGrupo = computed(() => this.suscripcion()?.nombreUnidad ?? '');

  protected readonly statCards = computed(() => {
    const sub = this.suscripcion();
    if (!sub) return [];

    const fechaRenovacion = new Date(sub.fechaRenovacion);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    return [
      {
        tipo: 'renovacion' as StatCardType,
        titulo: 'Renovación',
        valor: fechaRenovacion.toLocaleDateString('es-ES', opciones),
      },
      {
        tipo: 'plazas' as StatCardType,
        titulo: 'Plazas disponibles',
        valor: `${sub.plazasDisponibles} ${sub.plazasDisponibles === 1 ? 'plaza' : 'plazas'}`,
      },
      {
        tipo: 'aporte' as StatCardType,
        titulo: 'Tu aporte',
        valor: `${sub.precioPorPlaza.toFixed(2).replace('.', ',')}€`,
      },
    ];
  });

  protected readonly miembrosData = computed<MemberData[]>(() => {
    const sub = this.suscripcion();
    if (!sub) return [];

    return sub.miembros.map((m) => ({
      id: m.id,
      nombreCompleto: m.usuario.nombreCompleto,
      nombreUsuario: m.usuario.nombreUsuario,
      email: m.usuario.email,
      avatar: m.usuario.avatar,
      rol: m.esAnfitrion ? 'admin' : 'member',
    }));
  });

  protected readonly infoData = computed<SubscriptionInfoData>(() => {
    const sub = this.suscripcion();
    if (!sub) {
      return {
        credenciales: { usuario: '', contrasena: '' },
        pago: { montoRetenido: 0, estado: 'PENDIENTE', fechaLiberacion: '' },
        solicitudes: [],
      };
    }

    // Transformar SolicitudResponse[] a JoinRequest[]
    const solicitudes: JoinRequest[] = this.solicitudesPendientes().map((sol) => ({
      id: sol.id,
      nombreUsuario: sol.solicitante.nombreUsuario,
      email: sol.solicitante.email,
      avatarUrl: sol.solicitante.avatar,
    }));

    return {
      credenciales: sub.credenciales ?? { usuario: '', contrasena: '' },
      pago: sub.pago,
      solicitudes,
    };
  });

  /**
   * Busca una solicitud pendiente por su ID.
   * Método auxiliar para transformar JoinRequest a SolicitudResponse.
   */
  private findSolicitudById(id: number): SolicitudResponse | undefined {
    return this.solicitudesPendientes().find((s) => s.id === id);
  }

  /**
   * Maneja aceptar solicitud desde la tarjeta de información.
   * Transforma JoinRequest a SolicitudResponse buscando en las solicitudes pendientes.
   */
  protected async onAceptarSolicitudFromCard(request: JoinRequest): Promise<void> {
    const solicitud = this.findSolicitudById(request.id);
    if (!solicitud) return;
    await this.onAceptarSolicitud(solicitud);
  }

  /**
   * Maneja rechazar solicitud desde la tarjeta de información.
   * Transforma JoinRequest a SolicitudResponse buscando en las solicitudes pendientes.
   */
  protected async onRechazarSolicitudFromCard(request: JoinRequest): Promise<void> {
    const solicitud = this.findSolicitudById(request.id);
    if (!solicitud) return;
    await this.onRechazarSolicitud(solicitud);
  }

  protected async onAceptarSolicitud(request: SolicitudResponse): Promise<void> {
    const nombreUsuario = request.solicitante.nombreUsuario;
    this.modalService.open({
      title: '¿Aceptar solicitud?',
      content: `¿Estás seguro de que quieres aceptar la solicitud de <strong>${nombreUsuario}</strong> para unirse a esta suscripción?`,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await this.solicitudesStore.aprobar(request.id);
        } catch (error) {
          this.toastService.error('Error al aceptar la solicitud');
        }
      },
    });
  }

  protected async onRechazarSolicitud(request: SolicitudResponse): Promise<void> {
    const nombreUsuario = request.solicitante.nombreUsuario;
    this.modalService.open({
      title: '¿Rechazar solicitud?',
      content: `¿Estás seguro de que quieres rechazar la solicitud de <strong>${nombreUsuario}</strong>? Esta acción no se puede deshacer.`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await this.solicitudesStore.rechazar(request.id);
        } catch (error) {
          this.toastService.error('Error al rechazar la solicitud');
        }
      },
    });
  }

  protected async onSolicitarPlaza(): Promise<void> {
    const subId = this.suscripcion()?.id;
    if (!subId) return;

    try {
      await this.solicitudesStore.createSolicitudSuscripcion({ idSuscripcion: subId });
      this.tieneSolicitudPendiente.set(true);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al enviar la solicitud';
      this.toastService.error(mensaje);
    }
  }

  protected async onReintentar(): Promise<void> {
    const subId = Number(this.id());
    if (!isNaN(subId)) {
      await this.suscripcionesStore.refreshDetalle();
      await this.solicitudesStore.refreshPendientesSuscripcion();
      const tienePendiente = await this.solicitudesStore.tieneSolicitudPendienteSuscripcion(subId);
      this.tieneSolicitudPendiente.set(tienePendiente);
    }
  }
}
