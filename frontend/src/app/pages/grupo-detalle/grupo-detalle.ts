import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  BreadcrumbsComponent,
  type BreadcrumbItem,
  ButtonComponent,
  MemberListComponent,
  type MemberData,
  EmptySubscriptionsComponent,
  SubscriptionCardComponent,
  IconComponent,
} from '../../components/shared';
import type { UnidadFamiliar, MiembroUnidadResponse, SuscripcionSummary, SuscripcionCardData, GrupoCardData } from '../../models';
import {
  UnidadFamiliarService,
  SuscripcionService,
  ToastService,
  ModalService,
} from '../../services';

/**
 * Estado de navegación desde Dashboard.
 */
interface GrupoNavigationState {
  grupoPreview?: GrupoCardData;
}

/**
 * Página Detalle de Grupo.
 *
 * Soporta navegación con state desde Dashboard para mostrar
 * datos instantáneamente mientras carga la API completa.
 *
 * @usageNotes
 * Ruta: /grupos/:id (protegida por authGuard)
 */
@Component({
  selector: 'app-grupo-detalle',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
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
export class GrupoDetalleComponent {
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
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Leer state de navegación (solo disponible en constructor)
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as GrupoNavigationState | undefined;

    if (state?.grupoPreview) {
      // Pre-poblar nombre para breadcrumbs instantáneos
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

    // Cargar datos completos cuando cambia el ID
    effect(() => {
      const grupoId = Number(this.id());
      if (!grupoId || isNaN(grupoId)) {
        this.router.navigate(['/dashboard']);
        return;
      }
      this.cargarDatos(grupoId);
    });
  }

  // --- Computed ---
  protected readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const nombreGrupo = this.grupo()?.nombre ?? 'Grupo';
    return [
      { label: 'Inicio', url: '/dashboard' },
      { label: 'Grupos', url: '/dashboard' },
      { label: nombreGrupo },
    ];
  });

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
   * Carga todos los datos del grupo en paralelo.
   * Las suscripciones fallan graciosamente si hay error en el backend.
   */
  private cargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      grupo: this.unidadService.getGrupoById(id),
      miembros: this.unidadService.getMiembrosGrupo(id),
      suscripciones: this.suscripcionService.getSuscripcionesGrupo(id).pipe(
        catchError((err) => {
          console.warn('Error al cargar suscripciones:', err);
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, first: true, last: true, empty: true });
        })
      ),
    }).subscribe({
      next: ({ grupo, miembros, suscripciones }) => {
        this.grupo.set(grupo);
        this.miembros.set(miembros);
        this.suscripciones.set(suscripciones.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar grupo:', err);
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
      this.cargarDatos(grupoId);
    }
  }
}
