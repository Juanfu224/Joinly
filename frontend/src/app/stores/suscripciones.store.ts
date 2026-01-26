import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  Page,
  SuscripcionSummary,
  CreateSuscripcionRequest,
  SuscripcionResponse,
  SuscripcionDetalle,
  EstadoSuscripcion,
  Periodicidad,
} from '../models';
import { SuscripcionService } from '../services/suscripcion';
import { ToastService } from '../services/toast';

@Injectable({
  providedIn: 'root',
})
export class SuscripcionesStore {
  private readonly suscripcionService = inject(SuscripcionService);
  private readonly toastService = inject(ToastService);

  private _suscripciones = signal<SuscripcionSummary[]>([]);
  private _detalle = signal<SuscripcionDetalle | null>(null);
  private _loading = signal(false);
  private _loadingDetalle = signal(false);
  private _error = signal<string | null>(null);
  private _page = signal(0);
  private _pageSize = signal(20);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  private _estadosFiltro = signal<EstadoSuscripcion[]>([]);
  private _periodicidadFiltro = signal<Periodicidad | null>(null);

  readonly suscripciones = this._suscripciones.asReadonly();
  readonly detalle = this._detalle.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingDetalle = this._loadingDetalle.asReadonly();
  readonly error = this._error.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly estadosFiltro = this._estadosFiltro.asReadonly();
  readonly periodicidadFiltro = this._periodicidadFiltro.asReadonly();

  readonly suscripcionesFiltradas = computed(() => {
    let result = this._suscripciones();
    const estados = this._estadosFiltro();
    const periodicidad = this._periodicidadFiltro();

    if (estados.length > 0) {
      result = result.filter((s) => estados.includes(s.estado));
    }

    if (periodicidad) {
      result = result.filter((s) => s.periodicidad === periodicidad);
    }

    return result;
  });

  readonly totalPagesFiltradas = computed(() =>
    Math.ceil(this._suscripciones().length / this._pageSize()),
  );

  readonly suscripcionesPaginadas = computed(() => {
    const items = this._suscripciones();
    const page = this._page();
    const size = this._pageSize();
    const estados = this._estadosFiltro();
    const periodicidad = this._periodicidadFiltro();

    let result = items;

    if (estados.length > 0) {
      result = result.filter((s) => estados.includes(s.estado));
    }

    if (periodicidad) {
      result = result.filter((s) => s.periodicidad === periodicidad);
    }

    const start = page * size;
    return result.slice(start, start + size);
  });

  private currentUnidadId: number | null = null;

  async loadByUnidad(idUnidad: number, page = 0, size = 20): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    this.currentUnidadId = idUnidad;

    try {
      const response = await firstValueFrom(
        this.suscripcionService.getSuscripcionesGrupo(idUnidad, page, size),
      );
      this._suscripciones.set(response.content);
      this._page.set(response.number);
      this._pageSize.set(response.size);
      this._totalElements.set(response.totalElements);
      this._totalPages.set(response.totalPages);
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loading.set(false);
    }
  }

  async loadDetalle(idSuscripcion: number): Promise<void> {
    this._loadingDetalle.set(true);
    this._error.set(null);

    try {
      const detalle = await firstValueFrom(
        this.suscripcionService.getSuscripcionById(idSuscripcion),
      );
      this._detalle.set(detalle);
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loadingDetalle.set(false);
    }
  }

  async create(request: CreateSuscripcionRequest): Promise<SuscripcionResponse> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const nuevaSuscripcion = await firstValueFrom(
        this.suscripcionService.crearSuscripcion(request),
      );
      this.toastService.success('Suscripción creada exitosamente');
      return nuevaSuscripcion;
    } catch (error) {
      this._error.set(this.handleError(error));
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async updateSuscripcion(suscripcion: SuscripcionDetalle): Promise<void> {
    const previousDetalle = this._detalle();
    const previousList = this._suscripciones();

    try {
      const updated = await firstValueFrom(
        this.suscripcionService.getSuscripcionById(suscripcion.id),
      );
      this._detalle.set(updated);
      this._suscripciones.update((list) =>
        list.map((s) =>
          s.id === updated.id
            ? {
                ...s,
                estado: updated.estado,
                periodicidad: updated.periodicidad,
                plazasOcupadas: updated.plazasOcupadas,
              }
            : s,
        ),
      );
      this.toastService.success('Suscripción actualizada');
    } catch (error) {
      this._detalle.set(previousDetalle);
      this._suscripciones.set(previousList);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    this.toastService.error('Eliminación de suscripciones no implementada');
    throw new Error('Método de eliminación no disponible en este momento');
  }

  async nextPage(): Promise<void> {
    const current = this._page();
    const max = this._totalPages();

    if (current < max - 1 && this.currentUnidadId !== null) {
      await this.loadByUnidad(this.currentUnidadId, current + 1);
    }
  }

  async prevPage(): Promise<void> {
    const current = this._page();

    if (current > 0 && this.currentUnidadId !== null) {
      await this.loadByUnidad(this.currentUnidadId, current - 1);
    }
  }

  async goToPage(page: number): Promise<void> {
    if (page >= 0 && page < this._totalPages() && this.currentUnidadId !== null) {
      await this.loadByUnidad(this.currentUnidadId, page);
    }
  }

  setEstadoFiltro(estados: EstadoSuscripcion[]): void {
    this._estadosFiltro.set(estados);
  }

  toggleEstadoFiltro(estado: EstadoSuscripcion): void {
    const current = this._estadosFiltro();

    if (current.includes(estado)) {
      this._estadosFiltro.set(current.filter((e) => e !== estado));
    } else {
      this._estadosFiltro.set([...current, estado]);
    }
  }

  clearEstadoFiltro(): void {
    this._estadosFiltro.set([]);
  }

  setPeriodicidadFiltro(periodicidad: Periodicidad | null): void {
    this._periodicidadFiltro.set(periodicidad);
  }

  clearFiltros(): void {
    this._estadosFiltro.set([]);
    this._periodicidadFiltro.set(null);
  }

  async refresh(): Promise<void> {
    if (this.currentUnidadId !== null) {
      await this.loadByUnidad(this.currentUnidadId, this._page(), this._pageSize());
    }
  }

  async refreshDetalle(): Promise<void> {
    if (this._detalle()) {
      await this.loadDetalle(this._detalle()!.id);
    }
  }

  clear(): void {
    this._suscripciones.set([]);
    this._detalle.set(null);
    this._loading.set(false);
    this._loadingDetalle.set(false);
    this._error.set(null);
    this._page.set(0);
    this._pageSize.set(20);
    this._totalElements.set(0);
    this._totalPages.set(0);
    this._estadosFiltro.set([]);
    this._periodicidadFiltro.set(null);
    this.currentUnidadId = null;
  }

  updateFromExternal(suscripcion: SuscripcionDetalle): void {
    const wasUpdated = this._suscripciones().some((s) => s.id === suscripcion.id);
    const isDetalleVisible = this._detalle()?.id === suscripcion.id;

    this._suscripciones.update((list) =>
      list.map((s) =>
        s.id === suscripcion.id
          ? {
              ...s,
              estado: suscripcion.estado,
              periodicidad: suscripcion.periodicidad,
              plazasOcupadas: suscripcion.plazasOcupadas,
            }
          : s,
      ),
    );

    if (isDetalleVisible) {
      this._detalle.set(suscripcion);
    }

    if (wasUpdated || isDetalleVisible) {
      this.toastService.info('Suscripción actualizada por otro usuario');
    }
  }

  private handleError(error: any): string {
    console.error('Error en SuscripcionesStore:', error);

    if (error?.status === 401) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }

    if (error?.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (error?.status === 404) {
      return 'Suscripción no encontrada.';
    }

    return error?.error?.message || error?.message || 'Error desconocido';
  }
}
