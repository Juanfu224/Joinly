import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import {
  ButtonComponent,
  IconComponent,
  SolicitudCardComponent,
  SpinnerOverlayComponent,
  TabComponent,
  TabsComponent,
} from '../../../components/shared';
import type { IconName } from '../../../components/shared/icon/icon-paths';
import type { EstadoSolicitud, SolicitudResponse } from '../../../models';
import { ModalService, ToastService } from '../../../services';
import { SolicitudesStore } from '../../../stores';

interface FiltroOption {
  value: EstadoSolicitud | 'TODAS';
  label: string;
  icon: IconName;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    SolicitudCardComponent,
    SpinnerOverlayComponent,
    TabComponent,
    TabsComponent,
  ],
  templateUrl: './mis-solicitudes.html',
  styleUrl: './mis-solicitudes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisSolicitudesComponent implements OnInit {
  readonly solicitudesStore = inject(SolicitudesStore);
  readonly toastService = inject(ToastService);
  readonly modalService = inject(ModalService);

  protected readonly solicitudes = this.solicitudesStore.solicitudes;
  protected readonly isLoading = this.solicitudesStore.loading;
  protected readonly filtroEstado = this.solicitudesStore.estadoFiltro;

  protected readonly filtroOptions: FiltroOption[] = [
    { value: 'TODAS', label: 'Todas', icon: 'folder' },
    { value: 'PENDIENTE', label: 'Pendientes', icon: 'clock' },
    { value: 'APROBADA', label: 'Aprobadas', icon: 'circle-check' },
    { value: 'RECHAZADA', label: 'Rechazadas', icon: 'circle-x' },
  ];

  protected readonly contadores = computed(() => {
    const todas = this.solicitudes();
    return {
      total: todas.length,
      PENDIENTE: todas.filter((s) => s.estado === 'PENDIENTE').length,
      APROBADA: todas.filter((s) => s.estado === 'APROBADA').length,
      RECHAZADA: todas.filter((s) => s.estado === 'RECHAZADA').length,
      CANCELADA: todas.filter((s) => s.estado === 'CANCELADA').length,
    };
  });

  protected readonly solicitudesGrupos = computed(() => {
    const filtro = this.filtroEstado();
    return this.solicitudes()
      .filter((s) => s.tipoSolicitud === 'UNION_GRUPO')
      .filter((s) => !filtro || s.estado === filtro);
  });

  protected readonly solicitudesSuscripciones = computed(() => {
    const filtro = this.filtroEstado();
    return this.solicitudes()
      .filter((s) => s.tipoSolicitud === 'UNION_SUSCRIPCION')
      .filter((s) => !filtro || s.estado === filtro);
  });

  protected readonly haySolicitudesGrupos = computed(() => this.solicitudesGrupos().length > 0);
  protected readonly haySolicitudesSuscripciones = computed(() => this.solicitudesSuscripciones().length > 0);

  protected readonly contadoresGrupos = computed(() => ({
    total: this.solicitudes().filter((s) => s.tipoSolicitud === 'UNION_GRUPO').length,
  }));

  protected readonly contadoresSuscripciones = computed(() => ({
    total: this.solicitudes().filter((s) => s.tipoSolicitud === 'UNION_SUSCRIPCION').length,
  }));

  async ngOnInit(): Promise<void> {
    await this.solicitudesStore.loadMisSolicitudes();
  }

  protected onFiltroChange(estado: EstadoSolicitud | 'TODAS'): void {
    this.solicitudesStore.setEstadoFiltro(estado === 'TODAS' ? undefined : estado);
  }

  protected getContador(estado: EstadoSolicitud | 'total'): number {
    const contadores = this.contadores();
    return estado === 'total' ? contadores.total : contadores[estado];
  }

  protected onRequestCancel(solicitud: SolicitudResponse): void {
    const nombreDestino =
      solicitud.tipoSolicitud === 'UNION_GRUPO' && solicitud.unidad
        ? solicitud.unidad.nombre
        : (solicitud.suscripcion?.nombreServicio ?? 'desconocido');

    this.modalService.open({
      title: 'Cancelar solicitud',
      content: `¿Estás seguro de que deseas cancelar la solicitud para unirte a <strong>${nombreDestino}</strong>?<br><br><small>Esta acción no se puede deshacer.</small>`,
      confirmText: 'Sí, cancelar',
      cancelText: 'Mantener',
      onConfirm: async () => {
        try {
          await this.solicitudesStore.cancelar(solicitud.id);
        } catch (error) {
          this.toastService.error('Error al cancelar la solicitud');
        }
      },
    });
  }

  protected async onRefresh(): Promise<void> {
    await this.solicitudesStore.refreshMisSolicitudes();
  }
}
