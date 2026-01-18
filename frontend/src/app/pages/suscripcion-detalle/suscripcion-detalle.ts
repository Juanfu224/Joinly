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
import { SuscripcionService, ToastService } from '../../services';

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
  private readonly toastService = inject(ToastService);

  readonly id = input.required<string>();
  readonly grupoId = input.required<string>();

  protected readonly suscripcion = signal<SuscripcionDetalle | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['suscripcionData'] as ResolvedData<SuscripcionDetalle>;

    if (resolved.error) {
      this.error.set(resolved.error);
      this.toastService.error(resolved.error);
    } else if (resolved.data) {
      this.suscripcion.set(resolved.data);
    }
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
        pago: { montoRetenido: 0, estado: 'pendiente', fechaLiberacion: '' },
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
    const subId = this.suscripcion()?.id;
    if (!subId) return;

    this.suscripcionService.aceptarSolicitud(subId, request.id).subscribe({
      next: () => {
        this.toastService.success('Solicitud aceptada');
        this.recargarDatos(subId);
      },
      error: () => {
        this.toastService.error('Error al aceptar la solicitud');
      },
    });
  }

  protected onRechazarSolicitud(request: JoinRequest): void {
    const subId = this.suscripcion()?.id;
    if (!subId) return;

    this.suscripcionService.rechazarSolicitud(subId, request.id).subscribe({
      next: () => {
        this.toastService.success('Solicitud rechazada');
        this.recargarDatos(subId);
      },
      error: () => {
        this.toastService.error('Error al rechazar la solicitud');
      },
    });
  }

  private recargarDatos(id: number): void {
    this.isLoading.set(true);

    this.suscripcionService.getSuscripcionById(id).subscribe({
      next: (data) => {
        this.suscripcion.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al recargar los datos');
        this.isLoading.set(false);
      },
    });
  }

  protected onReintentar(): void {
    const subId = Number(this.id());
    if (subId && !isNaN(subId)) {
      this.recargarDatos(subId);
    }
  }
}
