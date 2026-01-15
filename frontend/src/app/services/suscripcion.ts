import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Page, SuscripcionSummary, CreateSuscripcionRequest, SuscripcionResponse } from '../models';
import { ApiService } from '../core/services/api.service';

/**
 * Servicio para gestión de suscripciones compartidas.
 *
 * Proporciona métodos para obtener y gestionar suscripciones
 * dentro de grupos familiares.
 */
@Injectable({
  providedIn: 'root',
})
export class SuscripcionService {
  private readonly api = inject(ApiService);

  /**
   * Obtiene las suscripciones de un grupo (unidad familiar).
   *
   * @param idUnidad ID del grupo
   * @param page Número de página (base 0)
   * @param size Elementos por página
   */
  getSuscripcionesGrupo(idUnidad: number, page = 0, size = 20): Observable<Page<SuscripcionSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.api.get<Page<SuscripcionSummary>>(`suscripciones/unidad/${idUnidad}`, { params });
  }

  /**
   * Crea una nueva suscripción en un grupo.
   *
   * @param request Datos de la nueva suscripción
   */
  crearSuscripcion(request: CreateSuscripcionRequest): Observable<SuscripcionResponse> {
    return this.api.post<SuscripcionResponse>('suscripciones', request);
  }
}
