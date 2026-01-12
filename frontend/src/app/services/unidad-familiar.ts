import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnidadFamiliar, CreateUnidadRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UnidadFamiliarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/unidades';

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
   * Valida si un código de invitación existe (usado por validadores asíncronos)
   */
  validarCodigo(codigo: string): Observable<UnidadFamiliar> {
    return this.http.get<UnidadFamiliar>(`${this.apiUrl}/codigo/${codigo}`);
  }
}
