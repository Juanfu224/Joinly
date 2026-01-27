import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UnidadFamiliar, CreateUnidadRequest, GrupoCardData } from '../models';
import { UnidadFamiliarService } from '../services/unidad-familiar';
import { ToastService } from '../services/toast';

@Injectable({
  providedIn: 'root',
})
export class GruposStore {
  private readonly grupoService = inject(UnidadFamiliarService);
  private readonly toastService = inject(ToastService);

  private _grupos = signal<UnidadFamiliar[]>([]);
  private _cards = signal<GrupoCardData[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _searchTerm = signal('');

  readonly grupos = this._grupos.asReadonly();
  readonly cards = this._cards.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  readonly totalGrupos = computed(() => this._grupos().length);
  readonly gruposActivos = computed(() => this._grupos().filter((g) => g.estado === 'ACTIVO'));
  readonly gruposFiltrados = computed(() => {
    const term = this._searchTerm().toLowerCase();
    if (!term) return this._grupos();

    return this._grupos().filter(
      (g) => g.nombre.toLowerCase().includes(term) || g.descripcion?.toLowerCase().includes(term),
    );
  });
  readonly cardsFiltradas = computed(() => {
    const term = this._searchTerm().toLowerCase();
    if (!term) return this._cards();

    return this._cards().filter((c) => c.nombre.toLowerCase().includes(term));
  });

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const grupos = await firstValueFrom(this.grupoService.getGruposAdministrados());
      this._grupos.set(grupos);
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loading.set(false);
    }
  }

  async loadCards(page = 0, size = 50): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.grupoService.getGruposCards(page, size));
      this._cards.set(response.content);
    } catch (error) {
      this._error.set(this.handleError(error));
    } finally {
      this._loading.set(false);
    }
  }

  async create(data: CreateUnidadRequest): Promise<UnidadFamiliar> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const nuevoGrupo = await firstValueFrom(this.grupoService.crearUnidad(data));
      this._grupos.update((list) => [...list, nuevoGrupo]);
      this.toastService.success('Grupo creado exitosamente');
      return nuevoGrupo;
    } catch (error) {
      this._error.set(this.handleError(error));
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async update(grupo: UnidadFamiliar): Promise<void> {
    const previous = this._grupos();
    const previousCards = this._cards();

    try {
      const updated = await firstValueFrom(this.grupoService.getGrupoById(grupo.id));
      this._grupos.update((list) => list.map((g) => (g.id === updated.id ? updated : g)));
      this._cards.update((cards) =>
        cards.map((c) => (c.id === updated.id ? { ...c, nombre: updated.nombre } : c)),
      );
      this.toastService.success('Grupo actualizado');
    } catch (error) {
      this._grupos.set(previous);
      this._cards.set(previousCards);
      this._error.set(this.handleError(error));
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    this.toastService.error('Eliminación de grupos no implementada');
    throw new Error('Método de eliminación no disponible en este momento');
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  async refreshCards(): Promise<void> {
    await this.loadCards();
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  getGrupoById(id: number): UnidadFamiliar | undefined {
    return this._grupos().find((g) => g.id === id);
  }

  clear(): void {
    this._grupos.set([]);
    this._cards.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._searchTerm.set('');
  }

  /**
   * Añade o actualiza un grupo en el store sin mostrar notificaciones.
   * Útil para cargar datos desde el resolver.
   */
  addOrUpdate(grupo: UnidadFamiliar): void {
    this._grupos.update((list) => {
      const exists = list.some((g) => g.id === grupo.id);
      return exists ? list.map((g) => (g.id === grupo.id ? grupo : g)) : [...list, grupo];
    });
    this._cards.update((cards) =>
      cards.map((c) => (c.id === grupo.id ? { ...c, nombre: grupo.nombre } : c)),
    );
  }

  /**
   * Actualiza un grupo desde una fuente externa (WebSocket, otros usuarios).
   * Muestra una notificación al usuario.
   */
  updateFromExternal(grupo: UnidadFamiliar): void {
    this.addOrUpdate(grupo);
    this.toastService.info('Grupo actualizado por otro usuario');
  }

  private handleError(error: any): string {
    console.error('Error en GruposStore:', error);

    if (error?.status === 401) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }

    if (error?.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (error?.status === 404) {
      return 'Grupo no encontrado.';
    }

    return error?.error?.message || error?.message || 'Error desconocido';
  }
}
