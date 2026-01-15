import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateSolicitudGrupoRequest, SolicitudResponse } from '../models';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private readonly api = inject(ApiService);

  /**
   * Solicita unirse a un grupo familiar mediante código.
   */
  unirseGrupo(data: CreateSolicitudGrupoRequest): Observable<SolicitudResponse> {
    return this.api.post<SolicitudResponse>('solicitudes/grupo', data);
  }
}
