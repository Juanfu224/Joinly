import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  CardComponent,
  TabsComponent,
  TabComponent,
  SolicitudCardComponent,
  SpinnerOverlayComponent,
} from '../../../components/shared';
import type { SolicitudResponse, EstadoSolicitud } from '../../../models';
import { SolicitudService, ToastService } from '../../../services';

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [
    CardComponent,
    TabsComponent,
    TabComponent,
    SolicitudCardComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './mis-solicitudes.html',
  styleUrl: './mis-solicitudes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisSolicitudesComponent implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly toastService = inject(ToastService);

  protected readonly solicitudes = signal<SolicitudResponse[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly filtroEstado = signal<EstadoSolicitud | undefined>(undefined);

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

  protected onCancelarSolicitud(id: number): void {
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
}
