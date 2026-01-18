export type EstadoSuscripcion = 'ACTIVA' | 'PAUSADA' | 'CANCELADA' | 'EXPIRADA';
export type Periodicidad = 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL';
export type PaymentStatus =
  | 'PENDIENTE'
  | 'FALLIDO'
  | 'RETENIDO'
  | 'LIBERADO'
  | 'REEMBOLSADO'
  | 'REEMBOLSO_PARCIAL'
  | 'DISPUTADO';

export interface ServicioSummary {
  id: number;
  nombre: string;
  categoria: string;
  logo: string | null;
  descripcion: string | null;
  maxUsuarios: number;
  precioReferencia: number | null;
}
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
export interface SuscripcionCardData {
  id: number;
  nombreServicio: string;
  precioPorPlaza: number;
  fechaRenovacion: string;
  plazasOcupadas: number;
  numPlazasTotal: number;
  estado: EstadoSuscripcion;
}
export interface CreateSuscripcionRequest {
  idUnidad: number;
  idServicio?: number;
  nombreServicio?: string;
  precioTotal: number;
  numPlazasTotal: number;
  fechaInicio: string;
  periodicidad: Periodicidad;
  anfitrionOcupaPlaza?: boolean;
  credencialUsuario?: string;
  credencialPassword?: string;
}
export interface MiembroSuscripcion {
  id: number;
  usuario: {
    id: number;
    nombreCompleto: string;
    nombreUsuario: string;
    email: string;
    avatar?: string;
  };
  fechaUnion: string;
  esAnfitrion: boolean;
}
export interface SolicitudSuscripcion {
  id: number;
  usuario: {
    id: number;
    nombreCompleto: string;
    nombreUsuario: string;
    email: string;
    avatar?: string;
  };
  fechaSolicitud: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
}
export interface SuscripcionDetalle {
  id: number;
  servicio: ServicioSummary;
  idUnidad: number;
  nombreUnidad: string;
  anfitrion: {
    id: number;
    nombreCompleto: string;
    email: string;
    nombreUsuario: string;
    avatar?: string;
  };
  precioTotal: number;
  moneda: string;
  precioPorPlaza: number;
  numPlazasTotal: number;
  plazasDisponibles: number;
  plazasOcupadas: number;
  anfitrionOcupaPlaza: boolean;
  fechaInicio: string;
  fechaRenovacion: string;
  periodicidad: Periodicidad;
  renovacionAutomatica: boolean;
  estado: EstadoSuscripcion;
  credenciales: {
    usuario: string;
    contrasena: string;
  } | null;
  pago: {
    montoRetenido: number;
    estado: PaymentStatus;
    fechaLiberacion: string;
  };
  miembros: MiembroSuscripcion[];
  solicitudes: SolicitudSuscripcion[];
}
