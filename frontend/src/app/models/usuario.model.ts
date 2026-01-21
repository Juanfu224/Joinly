export interface UpdatePerfilRequest {
  nombre: string;
  telefono?: string;
  avatar?: string;
  temaPreferido?: string;
}

export interface CambiarContrasenaRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
}

export interface PreferenciasNotificacion {
  notifSolicitudes: boolean;
  notifPagos: boolean;
  notifRecordatorios: boolean;
  notifNovedades: boolean;
}
