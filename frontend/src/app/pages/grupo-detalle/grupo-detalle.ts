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
} from '../../components/shared';
import type { UnidadFamiliar, MiembroUnidadResponse, SuscripcionSummary, SuscripcionCardData, GrupoCardData } from '../../models';
import { type GrupoDetalleData, type ResolvedData } from '../../resolvers';
import { UnidadFamiliarService, SuscripcionService, ToastService, ModalService } from '../../services';

interface GrupoNavigationState {
  grupoPreview?: GrupoCardData;
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
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  /**
   * ID del grupo recibido desde la ruta mediante Router Input Binding.
   * Angular 21 best practice: usar input() en lugar de ActivatedRoute.
   */
  readonly id = input.required<string>();

  protected readonly grupo = signal<UnidadFamiliar | null>(null);
  protected readonly miembros = signal<MiembroUnidadResponse[]>([]);
  protected readonly suscripciones = signal<SuscripcionSummary[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Leer state de navegación para mostrar datos instantáneamente
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as GrupoNavigationState | undefined;

    if (state?.grupoPreview) {
      this.grupo.set({
        id: state.grupoPreview.id,
        nombre: state.grupoPreview.nombre,
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
      },
      error: () => {
        this.error.set('No se pudo cargar el grupo. Intenta de nuevo.');
        this.isLoading.set(false);
        this.toastService.error('Error al cargar el grupo');
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
  protected onSuscripcionClick(_id: number): void {
    this.toastService.info('Detalles de suscripción próximamente');
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
