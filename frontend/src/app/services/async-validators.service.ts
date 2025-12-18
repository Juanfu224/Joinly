import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap, take, tap, timeout } from 'rxjs/operators';

/**
 * Respuesta de verificación de código de grupo.
 */
interface GroupCodeResponse {
  readonly id: number;
  readonly nombre: string;
  readonly codigoInvitacion: string;
}

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
  private readonly API_AUTH = '/api/v1/auth';

  /**
   * URL base de la API de unidades/grupos.
   */
  private readonly API_UNIDADES = '/api/v1/unidades';

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
      .get<{ available: boolean }>(`${this.API_AUTH}/check-email`, { params })
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

  // ==========================================================================
  // VALIDADOR: CÓDIGO DE GRUPO
  // ==========================================================================

  /**
   * Caché de códigos de grupo verificados.
   * Key: código normalizado, Value: existencia y timestamp
   */
  private groupCodeCache = new Map<string, CacheEntry<boolean>>();

  /**
   * Validador asíncrono para verificar existencia de código de grupo.
   *
   * Consulta al backend para verificar si un código de invitación
   * corresponde a un grupo existente.
   *
   * @returns AsyncValidatorFn que retorna null si el código existe, o {groupCodeNotFound: true} si no
   *
   * @example
   * ```typescript
   * // En el formulario de unirse a grupo
   * codigo: ['', {
   *   validators: [Validators.required, codePatternValidator(12)],
   *   asyncValidators: [this.asyncValidators.groupCodeExists()],
   *   updateOn: 'blur'
   * }]
   * ```
   */
  groupCodeExists(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const codigo = control.value;

      // No validar si el campo está vacío
      if (!codigo) {
        return of(null);
      }

      // Normalizar código: eliminar guiones y convertir a mayúsculas
      const normalizedCode = codigo.replace(/-/g, '').toUpperCase();

      // Validar formato básico antes de llamar al backend (12 caracteres alfanuméricos)
      if (!/^[A-Z0-9]{12}$/.test(normalizedCode)) {
        return of(null); // El validador síncrono de patrón manejará esto
      }

      return timer(this.DEBOUNCE_TIME).pipe(
        switchMap(() => this.checkGroupCodeExists(normalizedCode)),
        map((exists) => (exists ? null : { groupCodeNotFound: true })),
        take(1)
      );
    };
  }

  /**
   * Verifica la existencia de un código de grupo consultando el backend.
   *
   * @param codigo Código de invitación normalizado (12 caracteres)
   * @returns Observable que emite true si el código existe, false si no
   */
  private checkGroupCodeExists(codigo: string): Observable<boolean> {
    // Verificar caché primero
    const cached = this.getCachedGroupCode(codigo);
    if (cached !== null) {
      return of(cached);
    }

    // Realizar petición al backend
    return this.http
      .get<GroupCodeResponse>(`${this.API_UNIDADES}/codigo/${codigo}`)
      .pipe(
        timeout(this.TIMEOUT_MS),
        map(() => true), // Si responde 200, el código existe
        tap((exists) => this.cacheGroupCode(codigo, exists)),
        catchError((error: HttpErrorResponse) => {
          // 404 significa que el código no existe - es un caso válido
          if (error.status === 404) {
            this.cacheGroupCode(codigo, false);
            return of(false);
          }
          // Otros errores: no bloquear el formulario
          console.warn('[AsyncValidators] Error verificando código de grupo:', error);
          return of(true); // Asumir válido para no bloquear
        })
      );
  }

  /**
   * Obtiene un código de grupo del caché si está disponible y no ha expirado.
   */
  private getCachedGroupCode(codigo: string): boolean | null {
    const cached = this.groupCodeCache.get(codigo);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.CACHE_TTL;

    if (isExpired) {
      this.groupCodeCache.delete(codigo);
      return null;
    }

    return cached.value;
  }

  /**
   * Almacena un resultado de verificación de código de grupo en caché.
   */
  private cacheGroupCode(codigo: string, exists: boolean): void {
    this.groupCodeCache.set(codigo, {
      value: exists,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpia el caché de emails.
   * Útil para resetear el estado durante tests o después de operaciones críticas.
   */
  clearCache(): void {
    this.emailCache.clear();
    this.groupCodeCache.clear();
  }
}
