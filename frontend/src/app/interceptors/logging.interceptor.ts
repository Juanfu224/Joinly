import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

/**
 * HTTP Interceptor funcional para logging de requests/responses.
 *
 * Registra información detallada de cada petición HTTP para debugging
 * y monitoreo del rendimiento de la aplicación.
 *
 * @usageNotes
 * **Configuración en app.config.ts:**
 * ```typescript
 * provideHttpClient(
 *   withInterceptors([authInterceptor, loadingInterceptor, loggingInterceptor, errorInterceptor])
 * )
 * ```
 *
 * @remarks
 * - Solo activo en modo desarrollo (no en producción)
 * - Registra método, URL, duración y estado de cada request
 * - El logging va al final para ver la request/response ya modificada por otros interceptores
 * - Los logs siguen formato estructurado para facilitar debugging
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo logear en desarrollo
  const isProduction = false; // En producción real: environment.production
  if (isProduction) {
    return next(req);
  }

  const started = Date.now();
  const requestId = generateRequestId();

  // Log de inicio de request
  console.log(
    `%c[HTTP] ▶ ${req.method} ${req.urlWithParams}`,
    'color: #2196F3; font-weight: bold',
    {
      requestId,
      timestamp: new Date().toISOString(),
      headers: getHeadersObject(req.headers),
      body: req.body,
    }
  );

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          const statusColor = event.status < 400 ? '#4CAF50' : '#F44336';

          console.log(
            `%c[HTTP] ◀ ${req.method} ${req.urlWithParams} ${event.status} (${elapsed}ms)`,
            `color: ${statusColor}; font-weight: bold`,
            {
              requestId,
              duration: `${elapsed}ms`,
              status: event.status,
              statusText: event.statusText,
              body: event.body,
            }
          );
        }
      },
      error: (error) => {
        const elapsed = Date.now() - started;

        console.error(
          `%c[HTTP] ✖ ${req.method} ${req.urlWithParams} ERROR (${elapsed}ms)`,
          'color: #F44336; font-weight: bold',
          {
            requestId,
            duration: `${elapsed}ms`,
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          }
        );
      },
    })
  );
};

/**
 * Genera un ID único para tracking de requests.
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convierte HttpHeaders a un objeto plano para logging.
 */
function getHeadersObject(headers: any): Record<string, string> {
  const result: Record<string, string> = {};

  // Excluir headers sensibles del log
  const sensitiveHeaders = ['authorization', 'x-auth-token'];

  headers.keys().forEach((key: string) => {
    if (!sensitiveHeaders.includes(key.toLowerCase())) {
      result[key] = headers.get(key) ?? '';
    } else {
      result[key] = '[REDACTED]';
    }
  });

  return result;
}
