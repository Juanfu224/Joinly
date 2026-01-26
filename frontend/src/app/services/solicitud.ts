import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateSolicitudGrupoRequest,
  CreateSolicitudSuscripcionRequest,
  SolicitudResponse,
  EstadoSolicitud,
  Page,
} from '../models';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private readonly api = inject(ApiService);

  unirseGrupo(data: CreateSolicitudGrupoRequest): Observable<SolicitudResponse> {
    return this.api.post<SolicitudResponse>('solicitudes/grupo', data);
  }

  solicitarPlazaSuscripcion(
    data: CreateSolicitudSuscripcionRequest,
  ): Observable<SolicitudResponse> {
    return this.api.post<SolicitudResponse>('solicitudes/suscripcion', data);
  }

  getMisSolicitudes(
    estado?: EstadoSolicitud,
    fechaDesde?: string,
    fechaHasta?: string,
    page = 0,
    size = 20,
  ): Observable<Page<SolicitudResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'fechaSolicitud,desc');

    if (estado) {
      params = params.set('estado', estado);
    }
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }

    return this.api.get<Page<SolicitudResponse>>('solicitudes/mis-solicitudes', { params });
  }

  cancelarSolicitud(id: number): Observable<SolicitudResponse> {
    return this.api.post<SolicitudResponse>(`solicitudes/${id}/cancelar`, {});
  }

  tieneSolicitudPendienteSuscripcion(idSuscripcion: number): Observable<boolean> {
    return this.api.get<boolean>(`solicitudes/tiene-pendiente/suscripcion/${idSuscripcion}`);
  }

  tieneSolicitudPendienteGrupo(idUnidad: number): Observable<boolean> {
    return this.api.get<boolean>(`solicitudes/tiene-pendiente/grupo/${idUnidad}`);
  }

  getSolicitudesPendientesGrupo(idUnidad: number): Observable<SolicitudResponse[]> {
    return this.api.get<SolicitudResponse[]>(`solicitudes/grupo/${idUnidad}/pendientes`);
  }

  getSolicitudesPendientesSuscripcion(idSuscripcion: number): Observable<SolicitudResponse[]> {
    return this.api.get<SolicitudResponse[]>(`solicitudes/suscripcion/${idSuscripcion}/pendientes`);
  }

  aprobarSolicitud(id: number): Observable<SolicitudResponse> {
    return this.api.post<SolicitudResponse>(`solicitudes/${id}/aprobar`, {});
  }

  rechazarSolicitud(id: number, motivo?: string): Observable<SolicitudResponse> {
    const body = motivo ? { motivoRechazo: motivo } : {};
    return this.api.post<SolicitudResponse>(`solicitudes/${id}/rechazar`, body);
  }
}
