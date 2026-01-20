import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  SubscriptionStatCardComponent,
  MemberListComponent,
  SubscriptionInfoCardComponent,
  IconComponent,
  ButtonComponent,
  type MemberData,
  type SubscriptionInfoData,
  type JoinRequest,
  type StatCardType,
} from '../../components/shared';
import type { SuscripcionDetalle } from '../../models';
import { type ResolvedData } from '../../resolvers';
import { SuscripcionService, ToastService, AuthService, SolicitudService, ModalService } from '../../services';

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
  private readonly suscripcionService = inject(SuscripcionService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);

  readonly id = input.required<string>();
  readonly grupoId = input.required<string>();

  protected readonly suscripcion = signal<SuscripcionDetalle | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tieneSolicitudPendiente = signal(false);

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
    return sub.miembros.some(m => m.usuario.id === currentUser.id);
  });

  /** Indica si la suscripción está completa (sin plazas disponibles) */
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

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['suscripcionData'] as ResolvedData<SuscripcionDetalle>;

    if (resolved.error) {
      this.error.set(resolved.error);
      this.toastService.error(resolved.error);
    } else if (resolved.data) {
      this.suscripcion.set(resolved.data);
      this.verificarSolicitudPendiente();
    }
  }

  private verificarSolicitudPendiente(): void {
    const subId = this.suscripcion()?.id;
    if (!subId) return;

    this.solicitudService.tieneSolicitudPendienteSuscripcion(subId).subscribe({
      next: (tienePendiente) => {
        this.tieneSolicitudPendiente.set(tienePendiente);
      },
      error: () => {
        this.tieneSolicitudPendiente.set(false);
      },
    });
  }

  protected readonly tituloSuscripcion = computed(() =>
    this.suscripcion()?.servicio.nombre ?? ''
  );

  protected readonly descripcionSuscripcion = computed(() =>
    'Gestiona la suscripción con tu familia y ahorra'
  );

  protected readonly nombreGrupo = computed(() =>
    this.suscripcion()?.nombreUnidad ?? ''
  );

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

    return {
      credenciales: sub.credenciales ?? { usuario: '', contrasena: '' },
      pago: sub.pago,
      solicitudes: sub.solicitudes.map((s) => ({
        id: s.id,
        nombreUsuario: s.usuario.nombreUsuario,
        email: s.usuario.email,
        avatarUrl: s.usuario.avatar,
      })),
    };
  });

  protected onAceptarSolicitud(request: JoinRequest): void {
    this.modalService.open({
      title: '¿Aceptar solicitud?',
      content: `¿Estás seguro de que quieres aceptar la solicitud de <strong>${request.nombreUsuario}</strong> para unirse a esta suscripción?`,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.suscripcionService.aceptarSolicitud(request.id).subscribe({
          next: () => {
            this.toastService.success('Solicitud aceptada');
            this.recargarDatos();
          },
          error: () => {
            // El errorInterceptor ya muestra el mensaje de error
          },
        });
      },
    });
  }

  protected onRechazarSolicitud(request: JoinRequest): void {
    this.modalService.open({
      title: '¿Rechazar solicitud?',
      content: `¿Estás seguro de que quieres rechazar la solicitud de <strong>${request.nombreUsuario}</strong>? Esta acción no se puede deshacer.`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.suscripcionService.rechazarSolicitud(request.id).subscribe({
          next: () => {
            this.toastService.success('Solicitud rechazada');
            this.recargarDatos();
          },
          error: () => {
            // El errorInterceptor ya muestra el mensaje de error
          },
        });
      },
    });
  }

  private recargarDatos(): void {
    const subId = this.suscripcion()?.id ?? Number(this.id());
    if (!subId || isNaN(subId)) return;

    this.isLoading.set(true);

    this.suscripcionService.getSuscripcionById(subId).subscribe({
      next: (data) => {
        this.suscripcion.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // El errorInterceptor ya muestra el mensaje de error
        this.isLoading.set(false);
      },
    });
  }

  protected onSolicitarPlaza(): void {
    const subId = this.suscripcion()?.id;
    if (!subId) return;

    this.isLoading.set(true);

    this.solicitudService.solicitarPlazaSuscripcion({ idSuscripcion: subId }).subscribe({
      next: () => {
        this.toastService.success('Solicitud enviada correctamente. El anfitrión la revisará pronto.');
        this.tieneSolicitudPendiente.set(true);
        this.recargarDatos();
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error al enviar la solicitud';
        this.toastService.error(mensaje);
        this.isLoading.set(false);
      },
    });
  }

  protected onReintentar(): void {
    this.recargarDatos();
  }
}
