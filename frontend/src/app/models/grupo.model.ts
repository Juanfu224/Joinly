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
 * Datos resumidos de un grupo para mostrar en tarjetas del dashboard.
 * Corresponde al DTO UnidadFamiliarCardDTO del backend.
 */
export interface GrupoCardData {
  id: number;
  nombre: string;
  totalMiembros: number;
  totalSuscripciones: number;
}

/**
 * Respuesta paginada de Spring Data
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Rol de un miembro dentro del grupo
 */
export type RolMiembro = 'ADMINISTRADOR' | 'MIEMBRO';

/**
 * Estado de un miembro del grupo
 */
export type EstadoMiembro = 'ACTIVO' | 'INACTIVO' | 'EXPULSADO';

/**
 * Respuesta de miembro de unidad familiar.
 * Corresponde al DTO MiembroUnidadResponse del backend.
 */
export interface MiembroUnidadResponse {
  id: number;
  usuario: UsuarioSummary;
  rol: RolMiembro;
  fechaUnion: string;
  estado: EstadoMiembro;
}
