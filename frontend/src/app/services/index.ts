// ==========================================================================
// BARREL EXPORT: SERVICES
// ==========================================================================
// Exportaciones centralizadas para facilitar las importaciones

export { AlertService, type AlertType, type AlertMessage } from './alert';
export { AuthService, type User, type LoginData, type RegisterData, type AuthResponse } from './auth';
export { ModalService, type ModalConfig, type InviteModalConfig } from './modal';
export { ThemeService, type Theme } from './theme';
export {
  CommunicationService,
  type UserState,
  type SharedFilters,
  type AppEvent,
} from './communication';
export { ToastService, type ToastType, type ToastMessage } from './toast';
export { LoadingService } from './loading';
export { AsyncValidatorsService } from './async-validators.service';
export { UnidadFamiliarService } from './unidad-familiar';
export { SolicitudService } from './solicitud';
export { SuscripcionService } from './suscripcion';
export { BreadcrumbService, type Breadcrumb, type BreadcrumbResolver } from './breadcrumb.service';
