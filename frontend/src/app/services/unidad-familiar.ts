import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnidadFamiliar, CreateUnidadRequest, GrupoCardData, Page, MiembroUnidadResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UnidadFamiliarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/unidades';

  /**
   * Obtiene un grupo por su ID
   */
  getGrupoById(id: number): Observable<UnidadFamiliar> {
    return this.http.get<UnidadFamiliar>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene los miembros activos de un grupo
   */
  getMiembrosGrupo(id: number): Observable<MiembroUnidadResponse[]> {
    return this.http.get<MiembroUnidadResponse[]>(`${this.apiUrl}/${id}/miembros`);
  }

  /**
   * Crea una nueva unidad familiar
   */
  crearUnidad(data: CreateUnidadRequest): Observable<UnidadFamiliar> {
    return this.http.post<UnidadFamiliar>(this.apiUrl, data);
  }

  /**
   * Obtiene los grupos administrados por el usuario
   */
  getGruposAdministrados(): Observable<UnidadFamiliar[]> {
    return this.http.get<UnidadFamiliar[]>(`${this.apiUrl}/administradas`);
  }

  /**
   * Obtiene las tarjetas de grupos del usuario para el dashboard.
   * Incluye nombre, total de miembros y suscripciones activas.
   * 
   * @param page Número de página (base 0)
   * @param size Elementos por página (default: 50)
   */
  getGruposCards(page = 0, size = 50): Observable<Page<GrupoCardData>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<GrupoCardData>>(`${this.apiUrl}/miembro/cards`, { params });
  }

  /**
   * Valida si un código de invitación existe (usado por validadores asíncronos)
   */
  validarCodigo(codigo: string): Observable<UnidadFamiliar> {
    return this.http.get<UnidadFamiliar>(`${this.apiUrl}/codigo/${codigo}`);
  }
}
