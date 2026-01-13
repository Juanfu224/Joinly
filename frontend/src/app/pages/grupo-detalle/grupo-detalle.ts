import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import type { UnidadFamiliar, MiembroUnidadResponse, SuscripcionSummary, SuscripcionCardData } from '../../models';
import {
  UnidadFamiliarService,
  SuscripcionService,
  ToastService,
  ModalService,
} from '../../services';

/**
 * Página Detalle de Grupo - Vista del grupo al que pertenece el usuario.
 *
 * Muestra los miembros y suscripciones del grupo, permitiendo invitar
 * a más usuarios mediante código de invitación.
 *
 * ### Características:
 * - Breadcrumbs de navegación dinámicos
 * - Información del grupo (nombre y descripción)
 * - Lista de miembros con roles
 * - Grid de suscripciones compartidas
 * - Botón de invitar (modal con código)
 * - Estados de carga y error
 *
 * @usageNotes
 * Requiere autenticación. Protegida por authGuard.
 * Ruta: /grupos/:id
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
export class GrupoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly suscripcionService = inject(SuscripcionService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  // --- Estado ---
  protected readonly grupo = signal<UnidadFamiliar | null>(null);
  protected readonly miembros = signal<MiembroUnidadResponse[]>([]);
  protected readonly suscripciones = signal<SuscripcionSummary[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

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
      rol: m.rol === 'ADMINISTRADOR' ? 'admin' : 'member',
    }))
  );

  protected readonly hasSuscripciones = computed(() => this.suscripciones().length > 0);

  /**
   * Transforma SuscripcionSummary[] a SuscripcionCardData[] para el componente subscription-card.
   */
  protected readonly suscripcionCards = computed<SuscripcionCardData[]>(() =>
    this.suscripciones().map((s) => ({
      id: s.id,
      nombreServicio: s.nombreServicio,
      precioPorPlaza: s.precioPorPlaza,
      fechaRenovacion: s.fechaRenovacion,
      plazasDisponibles: s.numPlazasTotal,
      estado: s.estado,
    }))
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cargarDatos(id);
  }

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

    this.modalService.openInviteCode(codigo);
  }

  /**
   * Navega a la página de crear suscripción.
   */
  protected onCrearSuscripcion(): void {
    this.toastService.info('Crear suscripción próximamente');
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.cargarDatos(id);
    }
  }
}
