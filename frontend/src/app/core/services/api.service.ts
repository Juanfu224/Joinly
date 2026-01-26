import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, retry, throwError, timer, retryWhen, mergeMap } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

/**
 * Configuración de reintentos para peticiones HTTP.
 */
export interface RetryConfig {
  /** Número máximo de reintentos (default: 2) */
  maxRetries?: number;
  /** Delay entre reintentos en ms (default: 1000) */
  delay?: number;
  /** Solo reintentar en errores 5xx (default: true) */
  onlyServerErrors?: boolean;
}

/**
 * Opciones configurables para requests HTTP.
 */
export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?:
    | HttpParams
    | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  withCredentials?: boolean;
  /** Configuración de reintentos automáticos */
  retry?: RetryConfig;
}

/**
 * Servicio base centralizado para todas las operaciones HTTP.
 *
 * Proporciona métodos reutilizables para comunicación con la API REST,
 * manejo consistente de errores y logging estructurado.
 *
 * Ventajas:
 * - Única fuente de verdad para la URL base
 * - Manejo de errores centralizado
 * - Logs estructurados para debugging
 * - Type-safe con generics
 * - Fácil de mockear en tests
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  /**
   * Realiza un GET HTTP.
   *
   * @param endpoint - Ruta relativa del endpoint (ej: 'unidades/123')
   * @param options - Opciones adicionales del request
   * @returns Observable con la respuesta tipada
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { ...options, observe: 'body' as const })
      .pipe(
        this.applyRetry(options?.retry),
        catchError((error) => this.handleError(error, 'GET', endpoint)),
      );
  }

  /**
   * Realiza un POST HTTP.
   *
   * @param endpoint - Ruta relativa del endpoint
   * @param body - Cuerpo del request
   * @param options - Opciones adicionales del request
   * @returns Observable con la respuesta tipada
   */
  post<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'body' as const })
      .pipe(
        this.applyRetry(options?.retry),
        catchError((error) => this.handleError(error, 'POST', endpoint)),
      );
  }

  /**
   * Realiza un PUT HTTP.
   *
   * @param endpoint - Ruta relativa del endpoint
   * @param body - Cuerpo del request
   * @param options - Opciones adicionales del request
   * @returns Observable con la respuesta tipada
   */
  put<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'body' as const })
      .pipe(
        this.applyRetry(options?.retry),
        catchError((error) => this.handleError(error, 'PUT', endpoint)),
      );
  }

  /**
   * Realiza un PATCH HTTP.
   *
   * @param endpoint - Ruta relativa del endpoint
   * @param body - Cuerpo del request
   * @param options - Opciones adicionales del request
   * @returns Observable con la respuesta tipada
   */
  patch<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'body' as const })
      .pipe(
        this.applyRetry(options?.retry),
        catchError((error) => this.handleError(error, 'PATCH', endpoint)),
      );
  }

  /**
   * Realiza un DELETE HTTP.
   *
   * @param endpoint - Ruta relativa del endpoint
   * @param options - Opciones adicionales del request
   * @returns Observable con la respuesta tipada
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`, { ...options, observe: 'body' as const })
      .pipe(
        this.applyRetry(options?.retry),
        catchError((error) => this.handleError(error, 'DELETE', endpoint)),
      );
  }

  /**
   * Aplica lógica de reintentos a un Observable HTTP.
   *
   * @param config - Configuración de reintentos (opcional)
   * @returns Operador RxJS que aplica la lógica de retry
   */
  private applyRetry<T>(config?: RetryConfig) {
    return (source: Observable<T>): Observable<T> => {
      if (!config) {
        return source;
      }

      const maxRetries = config.maxRetries ?? 2;
      const delayMs = config.delay ?? 1000;
      const onlyServerErrors = config.onlyServerErrors ?? true;

      return source.pipe(
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((error: HttpErrorResponse, attempt) => {
              // Verificar si se alcanzó el máximo de reintentos
              if (attempt >= maxRetries) {
                return throwError(() => error);
              }

              // Si está configurado, solo reintentar en errores 5xx
              if (onlyServerErrors && (error.status < 500 || error.status >= 600)) {
                return throwError(() => error);
              }

              // Reintentar después del delay
              return timer(delayMs);
            }),
          ),
        ),
      );
    };
  }

  /**
   * Maneja errores HTTP de forma centralizada.
   *
   * Registra información estructurada del error para debugging y
   * propaga el error sin modificar para que los servicios de dominio
   * puedan manejarlo de forma específica.
   *
   * @param error - Error HTTP capturado
   * @param method - Método HTTP usado
   * @param endpoint - Endpoint que falló
   * @returns Observable que emite el error
   */
  private handleError(
    error: HttpErrorResponse,
    method: string,
    endpoint: string,
  ): Observable<never> {
    console.error('[ApiService] HTTP Error:', {
      method,
      endpoint,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return throwError(() => error);
  }
}
