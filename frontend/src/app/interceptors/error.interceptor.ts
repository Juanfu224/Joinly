import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, Observable } from 'rxjs';

import { ToastService } from '../services/toast';

/**
 * URLs donde no se debe mostrar toast automático de error.
 * Para endpoints que manejan errores de forma específica en el componente.
 */
const SILENT_ERROR_URLS: readonly string[] = [
  '/api/v1/auth/check-email',
  '/api/v1/auth/validate',
] as const;

/**
 * Verifica si una URL debe tener manejo silencioso de errores.
 */
function isSilentErrorUrl(url: string): boolean {
  return SILENT_ERROR_URLS.some((silent) => url.includes(silent));
}

/**
 * Verifica si el request tiene el header para saltar el manejo global de errores.
 */
function hasSkipErrorHandlingHeader(req: HttpRequest<unknown>): boolean {
  return req.headers.has('X-Skip-Error-Handling');
}

/**
 * HTTP Interceptor funcional para manejo global de errores.
 *
 * Captura errores HTTP y muestra mensajes al usuario según el código de estado.
 * Los servicios/componentes pueden seguir manejando errores específicos después.
 *
 * @usageNotes
 * **Configuración en app.config.ts:**
 * ```typescript
 * provideHttpClient(
 *   withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
 * )
 * ```
 *
 * **Saltar manejo global en request específico:**
 * ```typescript
 * this.http.get('/api/data', {
 *   headers: { 'X-Skip-Error-Handling': 'true' }
 * });
 * ```
 *
 * @remarks
 * - El error se propaga siempre para que los componentes puedan manejarlo
 * - Solo muestra toast si no es URL silenciosa y no tiene header de skip
 * - Mensajes estándar por código HTTP para consistencia UX
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verificar si este error debe manejarse globalmente
      const shouldShowToast =
        !isSilentErrorUrl(error.url ?? '') && !hasSkipErrorHandlingHeader(req);

      if (shouldShowToast) {
        const message = getErrorMessage(error);
        toastService.error(message);
      }

      // Siempre propagar el error para que los componentes puedan manejarlo
      return throwError(() => error);
    }),
  );
};

/**
 * Obtiene un mensaje de error amigable según el código de estado HTTP.
 */
function getErrorMessage(error: HttpErrorResponse): string {
  // Intentar obtener mensaje del backend primero
  if (error.error?.message && typeof error.error.message === 'string') {
    return error.error.message;
  }

  // Mensajes por código de estado HTTP
  switch (error.status) {
    case 0:
      return 'Sin conexión al servidor. Verifica tu conexión a internet.';
    case 400:
      return 'Datos inválidos. Revisa la información e intenta nuevamente.';
    case 401:
      return 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 409:
      return 'Conflicto con datos existentes.';
    case 422:
      return 'Datos no procesables. Revisa la información ingresada.';
    case 429:
      return 'Demasiadas peticiones. Espera un momento e intenta nuevamente.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Error del servidor. Intenta nuevamente más tarde.';
    default:
      return 'Error inesperado. Intenta nuevamente.';
  }
}
