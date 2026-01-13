import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, SuscripcionSummary } from '../models';

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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/suscripciones';

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

    return this.http.get<Page<SuscripcionSummary>>(`${this.apiUrl}/unidad/${idUnidad}`, { params });
  }
}
