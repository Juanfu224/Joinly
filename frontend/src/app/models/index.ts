// ==========================================================================
// BARREL EXPORT: MODELS
// ==========================================================================
// Exportaciones centralizadas de modelos de datos

export {
  type LoginData,
  type RegisterData,
  type AuthResponse,
  type User,
  type StoredTokens,
  type RefreshTokenRequest,
  type ApiError,
  type FieldError,
} from './auth.model';

export {
  type EstadoUnidadFamiliar,
  type UsuarioSummary,
  type UnidadFamiliar,
  type CreateUnidadRequest,
  type GrupoCardData,
  type Page,
  type RolMiembro,
  type EstadoMiembro,
  type MiembroUnidadResponse,
} from './grupo.model';

export {
  type EstadoSolicitud,
  type TipoSolicitud,
  type CreateSolicitudGrupoRequest,
  type CreateSolicitudSuscripcionRequest,
  type UnidadFamiliarSummary,
  type SolicitudResponse,
} from './solicitud.model';

export * from './suscripcion.model';

export {
  type ResourceState,
  initialResourceState,
  loadingResourceState,
  errorResourceState,
  successResourceState,
} from './resource-state.model';

export {
  type UpdatePerfilRequest,
  type CambiarContrasenaRequest,
  type PreferenciasNotificacion,
} from './usuario.model';

export {
  type CategoriaFaq,
  type Pregunta,
  type PreguntaFrecuente,
  type PreguntasAgrupadas,
} from './pregunta.model';
