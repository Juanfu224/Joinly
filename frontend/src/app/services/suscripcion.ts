import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Page,
  SuscripcionSummary,
  CreateSuscripcionRequest,
  SuscripcionResponse,
  SuscripcionDetalle,
} from '../models';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class SuscripcionService {
  private readonly api = inject(ApiService);

  getSuscripcionesGrupo(idUnidad: number, page = 0, size = 20): Observable<Page<SuscripcionSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.api.get<Page<SuscripcionSummary>>(`suscripciones/unidad/${idUnidad}`, { params });
  }

  crearSuscripcion(request: CreateSuscripcionRequest): Observable<SuscripcionResponse> {
    return this.api.post<SuscripcionResponse>('suscripciones', request);
  }

  getSuscripcionById(id: number): Observable<SuscripcionDetalle> {
    return this.api.get<SuscripcionDetalle>(`suscripciones/${id}`);
  }

  aceptarSolicitud(idSuscripcion: number, idSolicitud: number): Observable<void> {
    return this.api.post<void>(`suscripciones/${idSuscripcion}/solicitudes/${idSolicitud}/aceptar`, {});
  }

  rechazarSolicitud(idSuscripcion: number, idSolicitud: number): Observable<void> {
    return this.api.post<void>(`suscripciones/${idSuscripcion}/solicitudes/${idSolicitud}/rechazar`, {});
  }
}
