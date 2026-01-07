import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Datos del usuario autenticado
 */
export interface User {
  id: number;
  email: string;
  nombreUsuario: string;
  nombreCompleto: string;
}

/**
 * Datos para registro de usuario
 */
export interface RegisterData {
  email: string;
  password: string;
  nombreUsuario: string;
  nombreCompleto: string;
}

/**
 * Datos para login de usuario
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Servicio de autenticación mock.
 *
 * Simula un servicio de autenticación real con delays para testing de UX.
 * Usa signals para reactividad y está preparado para ser reemplazado
 * por implementación real con HttpClient.
 *
 * ### Características
 * - State management con signals (Angular 21)
 * - Computed signals para estado derivado
 * - Mock de delays HTTP realistas
 * - Validación básica de credenciales
 * - Persistencia en localStorage (simulada)
 * - Fácil migración a servicio real
 *
 * @usageNotes
 * ```typescript
 * // En component
 * private authService = inject(AuthService);
 *
 * // Login
 * this.authService.login(email, password).subscribe({
 *   next: (user) => this.router.navigate(['/dashboard']),
 *   error: (err) => this.handleError(err)
 * });
 *
 * // Check autenticación
 * if (this.authService.isAuthenticated()) {
 *   // Usuario logueado
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  /**
   * Signal del usuario actual (null si no está autenticado)
   */
  private readonly currentUserSignal = signal<User | null>(null);

  /**
   * Usuario actual (read-only)
   */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /**
   * Computed signal: indica si el usuario está autenticado
   */
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.loadUserFromStorage();
  }

  /**
   * Intenta hacer login con email y contraseña.
   *
   * Mock: acepta cualquier email válido + password >= 8 chars.
   * Simula delay de red de 800ms.
   *
   * @param data - Credenciales de login
   * @returns Observable con usuario autenticado
   */
  login(data: LoginData): Observable<User> {
    // Validación básica
    if (!data.email || !data.password) {
      return throwError(() => ({
        message: 'Email y contraseña son requeridos',
      }));
    }

    if (data.password.length < 8) {
      return throwError(() => ({
        message: 'Contraseña incorrecta',
      }));
    }

    // Simula usuario mock
    const mockUser: User = {
      id: 1,
      email: data.email,
      nombreUsuario: data.email.split('@')[0],
      nombreCompleto: 'Usuario Demo',
    };

    // Simula delay de red + guarda en state
    return of(mockUser).pipe(
      delay(800),
      // Efecto secundario: guardar en state y storage
      // En producción esto se hace en el subscribe del component
    );
  }

  /**
   * Registra un nuevo usuario.
   *
   * Mock: acepta cualquier dato válido.
   * Simula delay de red de 1000ms.
   *
   * @param data - Datos de registro
   * @returns Observable con usuario creado y autenticado
   */
  register(data: RegisterData): Observable<User> {
    // Validación básica
    if (!data.email || !data.password || !data.nombreUsuario) {
      return throwError(() => ({
        message: 'Todos los campos son requeridos',
      }));
    }

    if (data.password.length < 8) {
      return throwError(() => ({
        message: 'La contraseña debe tener al menos 8 caracteres',
      }));
    }

    // Simula usuario mock creado
    const mockUser: User = {
      id: 2,
      email: data.email,
      nombreUsuario: data.nombreUsuario,
      nombreCompleto: data.nombreCompleto,
    };

    // Simula delay de red
    return of(mockUser).pipe(delay(1000));
  }

  /**
   * Cierra sesión del usuario actual.
   * Limpia state y storage, redirige a home.
   */
  logout(): void {
    this.currentUserSignal.set(null);
    this.removeUserFromStorage();
    this.router.navigate(['/']);
  }

  /**
   * Guarda usuario autenticado en state y storage.
   * Llamar después de login/register exitoso.
   */
  setUser(user: User): void {
    this.currentUserSignal.set(user);
    this.saveUserToStorage(user);
  }

  /**
   * Carga usuario desde localStorage al iniciar app.
   * Permite persistir sesión entre recargas.
   */
  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem('joinly_user');
      if (stored) {
        const user = JSON.parse(stored) as User;
        this.currentUserSignal.set(user);
      }
    } catch (error) {
      // Si hay error parseando, limpiar storage
      this.removeUserFromStorage();
    }
  }

  /**
   * Guarda usuario en localStorage.
   */
  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem('joinly_user', JSON.stringify(user));
    } catch (error) {
      console.error('[AuthService] Error guardando usuario en storage:', error);
    }
  }

  /**
   * Elimina usuario de localStorage.
   */
  private removeUserFromStorage(): void {
    localStorage.removeItem('joinly_user');
  }
}
