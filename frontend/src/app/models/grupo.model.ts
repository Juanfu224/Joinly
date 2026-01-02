/**
 * Modelos de datos para Grupos (Unidades Familiares)
 * 
 * Estos modelos representan las estructuras de datos relacionadas con
 * los grupos familiares en la aplicación Joinly.
 */

/**
 * Estado de una unidad familiar
 */
export type EstadoUnidadFamiliar = 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';

/**
 * Resumen de usuario (usado en respuestas de grupo)
 */
export interface UsuarioSummary {
  id: number;
  nombreCompleto: string;
  email: string;
  nombreUsuario: string;
}

/**
 * Respuesta completa de una unidad familiar
 */
export interface UnidadFamiliar {
  id: number;
  nombre: string;
  codigoInvitacion: string;
  administrador: UsuarioSummary;
  fechaCreacion: string;
  descripcion: string | null;
  maxMiembros: number;
  estado: EstadoUnidadFamiliar;
}

/**
 * Datos para crear una nueva unidad familiar
 */
export interface CreateUnidadRequest {
  nombre: string;
  descripcion?: string;
}

/**
 * Datos resumidos de un grupo para mostrar en tarjetas
 */
export interface GrupoCardData {
  id: number;
  nombre: string;
  totalMiembros: number;
  suscripciones: string | null;
}
