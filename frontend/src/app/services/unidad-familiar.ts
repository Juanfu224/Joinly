import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  UnidadFamiliar,
  CreateUnidadRequest,
  GrupoCardData,
  Page,
  MiembroUnidadResponse,
} from '../models';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class UnidadFamiliarService {
  private readonly api = inject(ApiService);

  /**
   * Obtiene un grupo por su ID.
   */
  getGrupoById(id: number): Observable<UnidadFamiliar> {
    return this.api.get<UnidadFamiliar>(`unidades/${id}`);
  }

  /**
   * Obtiene los miembros activos de un grupo.
   */
  getMiembrosGrupo(id: number): Observable<MiembroUnidadResponse[]> {
    return this.api.get<MiembroUnidadResponse[]>(`unidades/${id}/miembros`);
  }

  /**
   * Crea una nueva unidad familiar.
   */
  crearUnidad(data: CreateUnidadRequest): Observable<UnidadFamiliar> {
    return this.api.post<UnidadFamiliar>('unidades', data);
  }

  /**
   * Obtiene los grupos administrados por el usuario.
   */
  getGruposAdministrados(): Observable<UnidadFamiliar[]> {
    return this.api.get<UnidadFamiliar[]>('unidades/administradas');
  }

  /**
   * Obtiene las tarjetas de grupos del usuario para el dashboard.
   * Incluye nombre, total de miembros y suscripciones activas.
   *
   * @param page Número de página (base 0)
   * @param size Elementos por página (default: 50)
   */
  getGruposCards(page = 0, size = 50): Observable<Page<GrupoCardData>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.api.get<Page<GrupoCardData>>('unidades/miembro/cards', { params });
  }

  /**
   * Valida si un código de invitación existe (usado por validadores asíncronos).
   */
  validarCodigo(codigo: string): Observable<UnidadFamiliar> {
    return this.api.get<UnidadFamiliar>(`unidades/codigo/${codigo}`);
  }
}
