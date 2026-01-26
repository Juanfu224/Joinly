import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  CreateSolicitudGrupoRequest,
  CreateSolicitudSuscripcionRequest,
  SolicitudResponse,
  EstadoSolicitud,
  Page,
} from '../models';
import { SolicitudService } from '../services/solicitud';
import { ToastService } from '../services/toast';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesStore {
  private readonly solicitudService = inject(SolicitudService);
  private readonly toastService = inject(ToastService);

  private _solicitudes = signal<SolicitudResponse[]>([]);
  private _pendientesGrupo = signal<SolicitudResponse[]>([]);
  private _pendientesSuscripcion = signal<SolicitudResponse[]>([]);
  private _pendientesGrupoVisible = signal<SolicitudResponse[]>([]);
  private _pendientesSuscripcionVisible = signal<SolicitudResponse[]>([]);
  private _loading = signal(false);
  private _loadingPendientesGrupo = signal(false);
  private _loadingPendientesSuscripcion = signal(false);
  private _loadingMorePendientesGrupo = signal(false);
  private _loadingMorePendientesSuscripcion = signal(false);
  private _error = signal<string | null>(null);
  private _page = signal(0);
  private _pageSize = signal(20);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  private _estadoFiltro = signal<EstadoSolicitud | undefined>(undefined);
  private _fechaDesdeFiltro = signal<string | undefined>(undefined);
  private _fechaHastaFiltro = signal<string | undefined>(undefined);
  private _visiblePendientesGrupoCount = signal(10);
  private _visiblePendientesSuscripcionCount = signal(10);

  readonly solicitudes = this._solicitudes.asReadonly();
  readonly pendientesGrupo = this._pendientesGrupo.asReadonly();
  readonly pendientesSuscripcion = this._pendientesSuscripcion.asReadonly();
  readonly pendientesGrupoVisible = this._pendientesGrupoVisible.asReadonly();
  readonly pendientesSuscripcionVisible = this._pendientesSuscripcionVisible.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingPendientesGrupo = this._loadingPendientesGrupo.asReadonly();
  readonly loadingPendientesSuscripcion = this._loadingPendientesSuscripcion.asReadonly();
  readonly loadingMorePendientesGrupo = this._loadingMorePendientesGrupo.asReadonly();
  readonly loadingMorePendientesSuscripcion = this._loadingMorePendientesSuscripcion.asReadonly();
  readonly error = this._error.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly estadoFiltro = this._estadoFiltro.asReadonly();
  readonly fechaDesdeFiltro = this._fechaDesdeFiltro.asReadonly();
  readonly fechaHastaFiltro = this._fechaHastaFiltro.asReadonly();
  readonly visiblePendientesGrupoCount = this._visiblePendientesGrupoCount.asReadonly();
  readonly visiblePendientesSuscripcionCount = this._visiblePendientesSuscripcionCount.asReadonly();

  readonly solicitudesPendientes = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'PENDIENTE'),
  );

  readonly solicitudesAprobadas = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'APROBADA'),
  );

  readonly solicitudesRechazadas = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'RECHAZADA'),
  );

  readonly solicitudesCanceladas = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'CANCELADA'),
  );

  readonly totalPendientesGrupo = computed(() => this._pendientesGrupo().length);
  readonly totalPendientesSuscripcion = computed(() => this._pendientesSuscripcion().length);

  readonly hasMorePendientesGrupo = computed(
    () => this._visiblePendientesGrupoCount() < this._pendientesGrupo().length,
  );

  readonly hasMorePendientesSuscripcion = computed(
    () => this._visiblePendientesSuscripcionCount() < this._pendientesSuscripcion().length,
  );

  private currentGrupoId: number | null = null;
  private currentSuscripcionId: number | null = null;

  async loadMisSolicitudes(
    estado?: EstadoSolicitud,
    fechaDesde?: string,
    fechaHasta?: string,
    page = 0,
    size = 20,
  ): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.solicitudService.getMisSolicitudes(estado, fechaDesde, fechaHasta, page, size),
      );
      this._solicitudes.set(response.content);
      this._page.set(response.number);
      this._pageSize.set(response.size);
      this._totalElements.set(response.totalElements);
      this._totalPages.set(response.totalPages);
      this._estadoFiltro.set(estado);
      this._fechaDesdeFiltro.set(fechaDesde);
      this._fechaHastaFiltro.set(fechaHasta);
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loading.set(false);
    }
  }

  async loadPendientesGrupo(idGrupo: number): Promise<void> {
    this._loadingPendientesGrupo.set(true);
    this._error.set(null);
    this.currentGrupoId = idGrupo;

    try {
      const pendientes = await firstValueFrom(
        this.solicitudService.getSolicitudesPendientesGrupo(idGrupo),
      );
      this._pendientesGrupo.set(pendientes);
      this._visiblePendientesGrupoCount.set(Math.min(10, pendientes.length));
      this._pendientesGrupoVisible.set(pendientes.slice(0, this._visiblePendientesGrupoCount()));
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loadingPendientesGrupo.set(false);
    }
  }

  async loadPendientesSuscripcion(idSuscripcion: number): Promise<void> {
    this._loadingPendientesSuscripcion.set(true);
    this._error.set(null);
    this.currentSuscripcionId = idSuscripcion;

    try {
      const pendientes = await firstValueFrom(
        this.solicitudService.getSolicitudesPendientesSuscripcion(idSuscripcion),
      );
      this._pendientesSuscripcion.set(pendientes);
      this._visiblePendientesSuscripcionCount.set(Math.min(10, pendientes.length));
      this._pendientesSuscripcionVisible.set(
        pendientes.slice(0, this._visiblePendientesSuscripcionCount()),
      );
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loadingPendientesSuscripcion.set(false);
    }
  }

  async createSolicitudGrupo(data: CreateSolicitudGrupoRequest): Promise<SolicitudResponse> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const solicitud = await firstValueFrom(this.solicitudService.unirseGrupo(data));
      this._solicitudes.update((list) => [...list, solicitud]);
      this.toastService.success('Solicitud enviada');
      return solicitud;
    } catch (error) {
      this._error.set(this.handleError(error));
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async createSolicitudSuscripcion(
    data: CreateSolicitudSuscripcionRequest,
  ): Promise<SolicitudResponse> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const solicitud = await firstValueFrom(this.solicitudService.solicitarPlazaSuscripcion(data));
      this._solicitudes.update((list) => [...list, solicitud]);
      this.toastService.success('Solicitud enviada');
      return solicitud;
    } catch (error) {
      this._error.set(this.handleError(error));
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async aprobar(id: number): Promise<void> {
    const previous = this._solicitudes();
    const solicitud = this._solicitudes().find((s) => s.id === id);
    const previousPendientesGrupo = this._pendientesGrupo();
    const previousPendientesSuscripcion = this._pendientesSuscripcion();
    const previousPendientesGrupoVisible = this._pendientesGrupoVisible();
    const previousPendientesSuscripcionVisible = this._pendientesSuscripcionVisible();
    const previousVisiblePendientesGrupoCount = this._visiblePendientesGrupoCount();
    const previousVisiblePendientesSuscripcionCount = this._visiblePendientesSuscripcionCount();

    this._solicitudes.update((list) =>
      list.map((s) => (s.id === id ? { ...s, estado: 'APROBADA' } : s)),
    );

    if (solicitud?.unidad) {
      this._pendientesGrupo.update((list) => list.filter((s) => s.id !== id));
      this._pendientesGrupoVisible.update((list) => list.filter((s) => s.id !== id));
      this._visiblePendientesGrupoCount.set(this._visiblePendientesGrupoCount() - 1);
    }
    if (solicitud?.suscripcion) {
      this._pendientesSuscripcion.update((list) => list.filter((s) => s.id !== id));
      this._pendientesSuscripcionVisible.update((list) => list.filter((s) => s.id !== id));
      this._visiblePendientesSuscripcionCount.set(this._visiblePendientesSuscripcionCount() - 1);
    }

    try {
      await firstValueFrom(this.solicitudService.aprobarSolicitud(id));
      this.toastService.success('Solicitud aprobada');
    } catch (error) {
      this._solicitudes.set(previous);
      this._pendientesGrupo.set(previousPendientesGrupo);
      this._pendientesSuscripcion.set(previousPendientesSuscripcion);
      this._pendientesGrupoVisible.set(previousPendientesGrupoVisible);
      this._pendientesSuscripcionVisible.set(previousPendientesSuscripcionVisible);
      this._visiblePendientesGrupoCount.set(previousVisiblePendientesGrupoCount);
      this._visiblePendientesSuscripcionCount.set(previousVisiblePendientesSuscripcionCount);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async rechazar(id: number, motivo?: string): Promise<void> {
    const previous = this._solicitudes();
    const solicitud = this._solicitudes().find((s) => s.id === id);
    const previousPendientesGrupo = this._pendientesGrupo();
    const previousPendientesSuscripcion = this._pendientesSuscripcion();
    const previousPendientesGrupoVisible = this._pendientesGrupoVisible();
    const previousPendientesSuscripcionVisible = this._pendientesSuscripcionVisible();
    const previousVisiblePendientesGrupoCount = this._visiblePendientesGrupoCount();
    const previousVisiblePendientesSuscripcionCount = this._visiblePendientesSuscripcionCount();

    this._solicitudes.update((list) =>
      list.map((s) =>
        s.id === id ? { ...s, estado: 'RECHAZADA', motivoRechazo: motivo || null } : s,
      ),
    );

    if (solicitud?.unidad) {
      this._pendientesGrupo.update((list) => list.filter((s) => s.id !== id));
      this._pendientesGrupoVisible.update((list) => list.filter((s) => s.id !== id));
      this._visiblePendientesGrupoCount.set(this._visiblePendientesGrupoCount() - 1);
    }
    if (solicitud?.suscripcion) {
      this._pendientesSuscripcion.update((list) => list.filter((s) => s.id !== id));
      this._pendientesSuscripcionVisible.update((list) => list.filter((s) => s.id !== id));
      this._visiblePendientesSuscripcionCount.set(this._visiblePendientesSuscripcionCount() - 1);
    }

    try {
      await firstValueFrom(this.solicitudService.rechazarSolicitud(id, motivo));
      this.toastService.success('Solicitud rechazada');
    } catch (error) {
      this._solicitudes.set(previous);
      this._pendientesGrupo.set(previousPendientesGrupo);
      this._pendientesSuscripcion.set(previousPendientesSuscripcion);
      this._pendientesGrupoVisible.set(previousPendientesGrupoVisible);
      this._pendientesSuscripcionVisible.set(previousPendientesSuscripcionVisible);
      this._visiblePendientesGrupoCount.set(previousVisiblePendientesGrupoCount);
      this._visiblePendientesSuscripcionCount.set(previousVisiblePendientesSuscripcionCount);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async cancelar(id: number): Promise<void> {
    const previous = this._solicitudes();

    this._solicitudes.update((list) =>
      list.map((s) => (s.id === id ? { ...s, estado: 'CANCELADA' } : s)),
    );

    try {
      await firstValueFrom(this.solicitudService.cancelarSolicitud(id));
      this.toastService.success('Solicitud cancelada');
    } catch (error) {
      this._solicitudes.set(previous);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async tieneSolicitudPendienteSuscripcion(idSuscripcion: number): Promise<boolean> {
    try {
      return await firstValueFrom(
        this.solicitudService.tieneSolicitudPendienteSuscripcion(idSuscripcion),
      );
    } catch (error) {
      this._error.set(this.handleError(error));
      return false;
    }
  }

  async tieneSolicitudPendienteGrupo(idUnidad: number): Promise<boolean> {
    try {
      return await firstValueFrom(this.solicitudService.tieneSolicitudPendienteGrupo(idUnidad));
    } catch (error) {
      this._error.set(this.handleError(error));
      return false;
    }
  }

  async nextPage(): Promise<void> {
    const current = this._page();
    const max = this._totalPages();

    if (current < max - 1) {
      await this.loadMisSolicitudes(
        this._estadoFiltro(),
        this._fechaDesdeFiltro(),
        this._fechaHastaFiltro(),
        current + 1,
        this._pageSize(),
      );
    }
  }

  async prevPage(): Promise<void> {
    const current = this._page();

    if (current > 0) {
      await this.loadMisSolicitudes(
        this._estadoFiltro(),
        this._fechaDesdeFiltro(),
        this._fechaHastaFiltro(),
        current - 1,
        this._pageSize(),
      );
    }
  }

  async goToPage(page: number): Promise<void> {
    if (page >= 0 && page < this._totalPages()) {
      await this.loadMisSolicitudes(
        this._estadoFiltro(),
        this._fechaDesdeFiltro(),
        this._fechaHastaFiltro(),
        page,
        this._pageSize(),
      );
    }
  }

  setEstadoFiltro(estado: EstadoSolicitud | undefined): void {
    this._estadoFiltro.set(estado);
  }

  setFechaDesdeFiltro(fecha: string | undefined): void {
    this._fechaDesdeFiltro.set(fecha);
  }

  setFechaHastaFiltro(fecha: string | undefined): void {
    this._fechaHastaFiltro.set(fecha);
  }

  clearFiltros(): void {
    this._estadoFiltro.set(undefined);
    this._fechaDesdeFiltro.set(undefined);
    this._fechaHastaFiltro.set(undefined);
  }

  async refreshMisSolicitudes(): Promise<void> {
    await this.loadMisSolicitudes(
      this._estadoFiltro(),
      this._fechaDesdeFiltro(),
      this._fechaHastaFiltro(),
      this._page(),
      this._pageSize(),
    );
  }

  async refreshPendientesGrupo(): Promise<void> {
    if (this.currentGrupoId !== null) {
      await this.loadPendientesGrupo(this.currentGrupoId);
    }
  }

  async refreshPendientesSuscripcion(): Promise<void> {
    if (this.currentSuscripcionId !== null) {
      await this.loadPendientesSuscripcion(this.currentSuscripcionId);
    }
  }

  async loadMorePendientesGrupo(): Promise<void> {
    if (this._loadingMorePendientesGrupo() || !this.hasMorePendientesGrupo()) return;

    this._loadingMorePendientesGrupo.set(true);

    try {
      const currentCount = this._visiblePendientesGrupoCount();
      const increment = 10;
      const newCount = Math.min(currentCount + increment, this._pendientesGrupo().length);

      await new Promise((resolve) => setTimeout(resolve, 300));

      this._visiblePendientesGrupoCount.set(newCount);
      this._pendientesGrupoVisible.set(this._pendientesGrupo().slice(0, newCount));
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loadingMorePendientesGrupo.set(false);
    }
  }

  async loadMorePendientesSuscripcion(): Promise<void> {
    if (this._loadingMorePendientesSuscripcion() || !this.hasMorePendientesSuscripcion()) return;

    this._loadingMorePendientesSuscripcion.set(true);

    try {
      const currentCount = this._visiblePendientesSuscripcionCount();
      const increment = 10;
      const newCount = Math.min(currentCount + increment, this._pendientesSuscripcion().length);

      await new Promise((resolve) => setTimeout(resolve, 300));

      this._visiblePendientesSuscripcionCount.set(newCount);
      this._pendientesSuscripcionVisible.set(this._pendientesSuscripcion().slice(0, newCount));
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loadingMorePendientesSuscripcion.set(false);
    }
  }

  clear(): void {
    this._solicitudes.set([]);
    this._pendientesGrupo.set([]);
    this._pendientesSuscripcion.set([]);
    this._pendientesGrupoVisible.set([]);
    this._pendientesSuscripcionVisible.set([]);
    this._loading.set(false);
    this._loadingPendientesGrupo.set(false);
    this._loadingPendientesSuscripcion.set(false);
    this._loadingMorePendientesGrupo.set(false);
    this._loadingMorePendientesSuscripcion.set(false);
    this._error.set(null);
    this._page.set(0);
    this._pageSize.set(20);
    this._totalElements.set(0);
    this._totalPages.set(0);
    this._estadoFiltro.set(undefined);
    this._fechaDesdeFiltro.set(undefined);
    this._fechaHastaFiltro.set(undefined);
    this._visiblePendientesGrupoCount.set(10);
    this._visiblePendientesSuscripcionCount.set(10);
    this.currentGrupoId = null;
    this.currentSuscripcionId = null;
  }

  updateFromExternal(solicitud: SolicitudResponse): void {
    let wasUpdated = false;
    let isPendientesAffected = false;

    this._solicitudes.update((list) => {
      const exists = list.some((s) => s.id === solicitud.id);
      if (exists) {
        wasUpdated = true;
        return list.map((s) => (s.id === solicitud.id ? solicitud : s));
      }
      return [...list, solicitud];
    });

    if (solicitud.estado === 'PENDIENTE') {
      if (solicitud.unidad && solicitud.unidad.id === this.currentGrupoId) {
        const existsInPendientes = this._pendientesGrupo().some((s) => s.id === solicitud.id);
        if (!existsInPendientes) {
          isPendientesAffected = true;
          this._pendientesGrupo.update((list) => [...list, solicitud]);
          this._visiblePendientesGrupoCount.set(this._visiblePendientesGrupoCount() + 1);
          this._pendientesGrupoVisible.set(
            this._pendientesGrupo().slice(0, this._visiblePendientesGrupoCount()),
          );
        }
      }

      if (solicitud.suscripcion && solicitud.suscripcion.id === this.currentSuscripcionId) {
        const existsInPendientes = this._pendientesSuscripcion().some((s) => s.id === solicitud.id);
        if (!existsInPendientes) {
          isPendientesAffected = true;
          this._pendientesSuscripcion.update((list) => [...list, solicitud]);
          this._visiblePendientesSuscripcionCount.set(
            this._visiblePendientesSuscripcionCount() + 1,
          );
          this._pendientesSuscripcionVisible.set(
            this._pendientesSuscripcion().slice(0, this._visiblePendientesSuscripcionCount()),
          );
        }
      }
    }

    if (wasUpdated || isPendientesAffected) {
      this.toastService.info('Solicitud actualizada por otro usuario');
    }
  }

  private handleError(error: any): string {
    console.error('Error en SolicitudesStore:', error);

    if (error?.status === 401) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }

    if (error?.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (error?.status === 404) {
      return 'Solicitud no encontrada.';
    }

    return error?.error?.message || error?.message || 'Error desconocido';
  }
}
