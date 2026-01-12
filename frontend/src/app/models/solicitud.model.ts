/**
 * Modelos de datos para Solicitudes
 * 
 * Representan las estructuras para solicitar unirse a grupos o suscripciones.
 */

/**
 * Estado de una solicitud
 */
export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

/**
 * Datos para solicitar unirse a un grupo mediante código
 */
export interface CreateSolicitudGrupoRequest {
  codigoInvitacion: string;
  mensaje?: string;
}

/**
 * Respuesta de una solicitud
 */
export interface SolicitudResponse {
  id: number;
  tipo: 'UNION_GRUPO' | 'UNION_SUSCRIPCION';
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  mensaje: string | null;
}
