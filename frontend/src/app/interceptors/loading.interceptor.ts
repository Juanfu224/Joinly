import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from '../services/loading';

/**
 * URLs que no deben activar el spinner global.
 * Incluye health checks, polling y endpoints frecuentes.
 */
const EXCLUDED_URLS: readonly string[] = [
  '/api/health',
  '/api/ping',
  '/api/notifications/poll',
  '/api/status',
] as const;

/**
 * Métodos HTTP que no activan el spinner por defecto.
 * Las peticiones GET suelen ser rápidas y no necesitan feedback visual.
 * Configurable según necesidades del proyecto.
 */
const EXCLUDED_METHODS: readonly string[] = [] as const;

/**
 * Verifica si una URL debe ser excluida del loading global.
 */
function isExcludedUrl(url: string): boolean {
  return EXCLUDED_URLS.some((excluded) => url.includes(excluded));
}

/**
 * Verifica si un método HTTP debe ser excluido del loading global.
 */
function isExcludedMethod(method: string): boolean {
  return EXCLUDED_METHODS.includes(method.toUpperCase());
}

/**
 * Verifica si el request tiene el header para saltar el loading.
 * Útil para requests específicos que necesitan loading local.
 */
function hasSkipLoadingHeader(req: HttpRequest<unknown>): boolean {
  return req.headers.has('X-Skip-Loading');
}

/**
 * HTTP Interceptor funcional para gestión automática de loading states.
 *
 * Muestra/oculta el spinner global automáticamente en cada request HTTP,
 * con soporte para exclusiones configurables.
 *
 * @usageNotes
 * **Configuración en app.config.ts:**
 * ```typescript
 * provideHttpClient(withInterceptors([loadingInterceptor]))
 * ```
 *
 * **Excluir request específico:**
 * ```typescript
 * this.http.get('/api/data', {
 *   headers: { 'X-Skip-Loading': 'true' }
 * });
 * ```
 *
 * @remarks
 * - Usa finalize() para garantizar hide() incluso en errores
 * - Soporta requests concurrentes (contador interno)
 * - Debounce automático vía LoadingService
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Verificar si este request debe mostrar el spinner
  const shouldShowLoading =
    !isExcludedUrl(req.url) && !isExcludedMethod(req.method) && !hasSkipLoadingHeader(req);

  if (shouldShowLoading) {
    loadingService.show();
  }

  // Remover header interno si existe (no enviarlo al servidor)
  const cleanReq = hasSkipLoadingHeader(req)
    ? req.clone({ headers: req.headers.delete('X-Skip-Loading') })
    : req;

  return next(cleanReq).pipe(
    finalize(() => {
      if (shouldShowLoading) {
        loadingService.hide();
      }
    }),
  );
};
