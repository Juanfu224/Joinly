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
 * Datos para crear una nueva suscripción (simplificado según diseño Figma)
 */
export interface CreateSuscripcionRequest {
  idUnidad: number;
  nombreServicio: string;
  precioTotal: number;
  numPlazasTotal: number;
  fechaInicio: string;
  periodicidad: Periodicidad;
  credencialUsuario?: string;
  credencialPassword?: string;
}
