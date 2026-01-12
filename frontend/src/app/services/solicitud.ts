import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSolicitudGrupoRequest, SolicitudResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/solicitudes';

  /**
   * Solicita unirse a un grupo familiar mediante código
   */
  unirseGrupo(data: CreateSolicitudGrupoRequest): Observable<SolicitudResponse> {
    return this.http.post<SolicitudResponse>(`${this.apiUrl}/grupo`, data);
  }
}
