import type { UsuarioSummary } from './grupo.model';
import type { SuscripcionSummary } from './suscripcion.model';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

export type TipoSolicitud = 'UNION_GRUPO' | 'UNION_SUSCRIPCION';

export interface CreateSolicitudGrupoRequest {
  codigoInvitacion: string;
  mensaje?: string;
}

export interface CreateSolicitudSuscripcionRequest {
  idSuscripcion: number;
  mensaje?: string;
}

export interface UnidadFamiliarSummary {
  id: number;
  nombre: string;
  codigoInvitacion: string;
}

export interface SolicitudResponse {
  id: number;
  tipoSolicitud: TipoSolicitud;
  solicitante: UsuarioSummary;
  unidad: UnidadFamiliarSummary | null;
  suscripcion: SuscripcionSummary | null;
  mensaje: string | null;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
  estado: EstadoSolicitud;
  motivoRechazo: string | null;
  aprobador: UsuarioSummary | null;
}
