/**
 * Modelos de datos para Suscripciones
 * 
 * Estos modelos representan las estructuras de datos relacionadas con
 * las suscripciones compartidas en la aplicación Joinly.
 */

/**
 * Estado de una suscripción
 */
export type EstadoSuscripcion = 'ACTIVA' | 'PAUSADA' | 'CANCELADA' | 'EXPIRADA';

/**
 * Periodicidad de pago de una suscripción
 */
export type Periodicidad = 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL';

/**
 * Resumen de un servicio de suscripción
 */
export interface ServicioSummary {
  id: number;
  nombre: string;
  categoria: string;
  logo: string | null;
  descripcion: string | null;
  maxUsuarios: number;
  precioReferencia: number | null;
}

/**
 * Respuesta completa de una suscripción
 */
export interface SuscripcionResponse {
  id: number;
  servicio: ServicioSummary;
  idUnidad: number;
  anfitrion: {
    id: number;
    nombreCompleto: string;
    email: string;
    nombreUsuario: string;
  };
  precioTotal: number;
  moneda: string;
  precioPorPlaza: number;
  numPlazasTotal: number;
  anfitrionOcupaPlaza: boolean;
  fechaInicio: string;
  fechaRenovacion: string;
  periodicidad: Periodicidad;
  renovacionAutomatica: boolean;
  estado: EstadoSuscripcion;
  plazasDisponibles: number;
  plazasOcupadas: number;
}

/**
 * Resumen de suscripción
 */
export interface SuscripcionSummary {
  id: number;
  nombreServicio: string;
  logoServicio: string | null;
  precioPorPlaza: number;
  fechaRenovacion: string;
  periodicidad: Periodicidad;
  estado: EstadoSuscripcion;
  numPlazasTotal: number;
  plazasOcupadas: number;
}

/**
 * Datos resumidos de una suscripción para mostrar en tarjetas
 */
export interface SuscripcionCardData {
  id: number;
  nombreServicio: string;
  precioPorPlaza: number;
  fechaRenovacion: string;
  plazasOcupadas: number;
  numPlazasTotal: number;
  estado: EstadoSuscripcion;
}

/**
 * Datos para crear una nueva suscripción.
 * 
 * Permite identificar el servicio de dos formas:
 * - `idServicio`: ID de un servicio existente en el catálogo
 * - `nombreServicio`: Nombre del servicio (se buscará o creará automáticamente)
 * 
 * Al menos uno de los dos debe estar presente.
 */
export interface CreateSuscripcionRequest {
  /** ID de la unidad familiar donde se creará la suscripción */
  idUnidad: number;
  /** ID del servicio del catálogo (opcional si se proporciona nombreServicio) */
  idServicio?: number;
  /** Nombre del servicio - se buscará o creará si no existe (opcional si se proporciona idServicio) */
  nombreServicio?: string;
  /** Precio total de la suscripción */
  precioTotal: number;
  /** Número total de plazas */
  numPlazasTotal: number;
  /** Fecha de inicio en formato ISO (YYYY-MM-DD) */
  fechaInicio: string;
  /** Periodicidad del pago */
  periodicidad: Periodicidad;
  /** Si el anfitrión ocupará una plaza (default: true) */
  anfitrionOcupaPlaza?: boolean;
}
