import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  TabsComponent,
  TabComponent,
  SolicitudCardComponent,
  SpinnerOverlayComponent,
  IconComponent,
} from '../../../components/shared';
import type { SolicitudResponse, EstadoSolicitud } from '../../../models';
import type { IconName } from '../../../components/shared/icon/icon-paths';
import { SolicitudService, ToastService, ModalService } from '../../../services';

interface FiltroOption {
  value: EstadoSolicitud | 'TODAS';
  label: string;
  icon: IconName;
}

interface EstadisticaCard {
  estado: EstadoSolicitud | 'total';
  label: string;
  icon: IconName;
  colorClass: string;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [
    TabsComponent,
    TabComponent,
    SolicitudCardComponent,
    SpinnerOverlayComponent,
    IconComponent,
  ],
  templateUrl: './mis-solicitudes.html',
  styleUrl: './mis-solicitudes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisSolicitudesComponent implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  protected readonly solicitudes = signal<SolicitudResponse[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly filtroEstado = signal<EstadoSolicitud | undefined>(undefined);
  protected readonly activeTab = signal<'grupos' | 'suscripciones'>('grupos');

  protected readonly filtroOptions: FiltroOption[] = [
    { value: 'TODAS', label: 'Todas', icon: 'folder' },
    { value: 'PENDIENTE', label: 'Pendientes', icon: 'clock' },
    { value: 'APROBADA', label: 'Aprobadas', icon: 'circle-check' },
    { value: 'RECHAZADA', label: 'Rechazadas', icon: 'circle-x' },
  ];

  protected readonly estadisticas: EstadisticaCard[] = [
    { estado: 'total', label: 'Total', icon: 'folder', colorClass: 'total' },
    { estado: 'PENDIENTE', label: 'Pendientes', icon: 'clock', colorClass: 'pendiente' },
    { estado: 'APROBADA', label: 'Aprobadas', icon: 'circle-check', colorClass: 'aprobada' },
    { estado: 'RECHAZADA', label: 'Rechazadas', icon: 'circle-x', colorClass: 'rechazada' },
  ];

  protected readonly contadores = computed(() => {
    const todas = this.solicitudes();
    return {
      total: todas.length,
      PENDIENTE: todas.filter(s => s.estado === 'PENDIENTE').length,
      APROBADA: todas.filter(s => s.estado === 'APROBADA').length,
      RECHAZADA: todas.filter(s => s.estado === 'RECHAZADA').length,
      CANCELADA: todas.filter(s => s.estado === 'CANCELADA').length,
    };
  });

  protected readonly solicitudesGrupos = computed(() => {
    const todas = this.solicitudes();
    const filtro = this.filtroEstado();
    let filtradas = todas.filter(s => s.tipoSolicitud === 'UNION_GRUPO');
    if (filtro) {
      filtradas = filtradas.filter(s => s.estado === filtro);
    }
    return filtradas;
  });

  protected readonly solicitudesSuscripciones = computed(() => {
    const todas = this.solicitudes();
    const filtro = this.filtroEstado();
    let filtradas = todas.filter(s => s.tipoSolicitud === 'UNION_SUSCRIPCION');
    if (filtro) {
      filtradas = filtradas.filter(s => s.estado === filtro);
    }
    return filtradas;
  });

  protected readonly haySolicitudesGrupos = computed(() => {
    return this.solicitudesGrupos().length > 0;
  });

  protected readonly haySolicitudesSuscripciones = computed(() => {
    return this.solicitudesSuscripciones().length > 0;
  });

  protected readonly haySolicitudes = computed(() => {
    return this.solicitudes().length > 0;
  });

  protected readonly contadoresGrupos = computed(() => {
    const grupos = this.solicitudes().filter(s => s.tipoSolicitud === 'UNION_GRUPO');
    return {
      total: grupos.length,
      pendientes: grupos.filter(s => s.estado === 'PENDIENTE').length,
    };
  });

  protected readonly contadoresSuscripciones = computed(() => {
    const suscripciones = this.solicitudes().filter(s => s.tipoSolicitud === 'UNION_SUSCRIPCION');
    return {
      total: suscripciones.length,
      pendientes: suscripciones.filter(s => s.estado === 'PENDIENTE').length,
    };
  });

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  private cargarSolicitudes(): void {
    this.isLoading.set(true);
    this.solicitudService.getMisSolicitudes().subscribe({
      next: (page) => {
        this.solicitudes.set(page.content);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar las solicitudes');
        this.isLoading.set(false);
      },
    });
  }

  protected onFiltroChange(estado: EstadoSolicitud | 'TODAS'): void {
    this.filtroEstado.set(estado === 'TODAS' ? undefined : estado);
  }

  protected getContador(estado: EstadoSolicitud | 'total'): number {
    const contadores = this.contadores();
    return estado === 'total' ? contadores.total : contadores[estado];
  }

  protected onRequestCancel(solicitud: SolicitudResponse): void {
    const nombreDestino = solicitud.tipoSolicitud === 'UNION_GRUPO' && solicitud.unidad
      ? solicitud.unidad.nombre
      : solicitud.suscripcion?.nombreServicio ?? 'desconocido';

    this.modalService.open({
      title: 'Cancelar solicitud',
      content: `¿Estás seguro de que deseas cancelar la solicitud para unirte a <strong>${nombreDestino}</strong>?<br><br><small>Esta acción no se puede deshacer.</small>`,
      confirmText: 'Sí, cancelar',
      cancelText: 'Mantener',
      onConfirm: () => this.confirmarCancelacion(solicitud.id),
    });
  }

  private confirmarCancelacion(id: number): void {
    this.isLoading.set(true);

    this.solicitudService.cancelarSolicitud(id).subscribe({
      next: () => {
        this.toastService.success('Solicitud cancelada correctamente');
        this.cargarSolicitudes();
      },
      error: () => {
        this.toastService.error('Error al cancelar la solicitud');
        this.isLoading.set(false);
      },
    });
  }

  protected onTabChange(tab: 'grupos' | 'suscripciones'): void {
    this.activeTab.set(tab);
  }

  protected onRefresh(): void {
    this.cargarSolicitudes();
  }
}
