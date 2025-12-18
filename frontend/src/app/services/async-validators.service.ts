import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap, take, tap, timeout } from 'rxjs/operators';

/**
 * Configuración para caché de validaciones asíncronas.
 */
interface CacheEntry<T> {
  readonly value: T;
  readonly timestamp: number;
}

/**
 * Servicio para validadores asíncronos de formularios.
 *
 * Proporciona validadores que consultan al backend para verificar
 * la disponibilidad de recursos (emails, usernames, etc.).
 *
 * @remarks
 * - Implementa caché con TTL para reducir llamadas al backend
 * - Debounce automático para evitar spam de requests
 * - Manejo resiliente de errores de red (no bloquea el formulario)
 * - Timeout de 5 segundos para evitar esperas infinitas
 *
 * @usageNotes
 * **En FormBuilder:**
 * ```typescript
 * this.form = this.fb.group({
 *   email: ['', {
 *     validators: [Validators.required, Validators.email],
 *     asyncValidators: [this.asyncValidators.emailAvailable()],
 *     updateOn: 'blur'
 *   }]
 * });
 * ```
 *
 * **Para edición (excluir email actual):**
 * ```typescript
 * asyncValidators: [this.asyncValidators.emailAvailable(currentUserId)]
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AsyncValidatorsService {
  private readonly http = inject(HttpClient);

  /**
   * URL base de la API de autenticación.
   * Usa ruta relativa para aprovechar el proxy de Angular.
   */
  private readonly API_BASE = '/api/v1/auth';

  /**
   * Tiempo de debounce antes de realizar la validación (ms).
   * Evita validaciones mientras el usuario está escribiendo.
   */
  private readonly DEBOUNCE_TIME = 500;

  /**
   * Tiempo máximo de espera para la respuesta del servidor (ms).
   */
  private readonly TIMEOUT_MS = 5000;

  /**
   * Tiempo de vida del caché (ms).
   * 5 minutos es suficiente para una sesión de formulario típica.
   */
  private readonly CACHE_TTL = 5 * 60 * 1000;

  /**
   * Caché de emails verificados.
   * Key: email, Value: disponibilidad y timestamp
   */
  private emailCache = new Map<string, CacheEntry<boolean>>();

  /**
   * Validador asíncrono para verificar disponibilidad de email.
   *
   * Consulta al backend para verificar si un email está disponible
   * para registro o si ya está en uso por otro usuario.
   *
   * @param excludeUserId ID del usuario a excluir (para edición de perfil)
   * @returns AsyncValidatorFn que retorna null si está disponible, o {emailTaken: true} si no
   *
   * @example
   * ```typescript
   * // Para registro (nuevo usuario)
   * email: ['', {
   *   asyncValidators: [this.asyncValidators.emailAvailable()]
   * }]
   *
   * // Para edición (excluir email actual)
   * email: ['', {
   *   asyncValidators: [this.asyncValidators.emailAvailable(user.id)]
   * }]
   * ```
   */
  emailAvailable(excludeUserId?: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;

      // No validar si el campo está vacío (lo maneja el validador required)
      if (!email) {
        return of(null);
      }

      // Validar formato básico antes de llamar al backend
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return of(null); // El validador de email síncrono manejará esto
      }

      return timer(this.DEBOUNCE_TIME).pipe(
        switchMap(() => this.checkEmailAvailability(email, excludeUserId)),
        map((available) => (available ? null : { emailTaken: true })),
        take(1)
      );
    };
  }

  /**
   * Verifica la disponibilidad de un email consultando el backend.
   *
   * @param email Email a verificar
   * @param excludeUserId ID de usuario a excluir de la verificación
   * @returns Observable que emite true si el email está disponible, false si está ocupado
   */
  private checkEmailAvailability(email: string, excludeUserId?: string): Observable<boolean> {
    // Verificar caché primero
    const cached = this.getCachedEmail(email);
    if (cached !== null) {
      return of(cached);
    }

    // Preparar parámetros de la petición
    let params = new HttpParams().set('email', email);
    if (excludeUserId) {
      params = params.set('excludeUserId', excludeUserId);
    }

    // Realizar petición al backend
    return this.http
      .get<{ available: boolean }>(`${this.API_BASE}/check-email`, { params })
      .pipe(
        timeout(this.TIMEOUT_MS),
        map((response) => response.available),
        tap((available) => this.cacheEmail(email, available)),
        catchError((error) => {
          console.warn('[AsyncValidators] Error verificando email:', error);
          // En caso de error de red, no bloquear el formulario
          // El backend hará la validación definitiva en el submit
          return of(true);
        })
      );
  }

  /**
   * Obtiene un email del caché si está disponible y no ha expirado.
   *
   * @param email Email a buscar en caché
   * @returns Disponibilidad del email o null si no está en caché o expiró
   */
  private getCachedEmail(email: string): boolean | null {
    const cached = this.emailCache.get(email);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.CACHE_TTL;

    if (isExpired) {
      this.emailCache.delete(email);
      return null;
    }

    return cached.value;
  }

  /**
   * Almacena un resultado de verificación de email en caché.
   *
   * @param email Email verificado
   * @param available Disponibilidad del email
   */
  private cacheEmail(email: string, available: boolean): void {
    this.emailCache.set(email, {
      value: available,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpia el caché de emails.
   * Útil para resetear el estado durante tests o después de operaciones críticas.
   */
  clearCache(): void {
    this.emailCache.clear();
  }
}
