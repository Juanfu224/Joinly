import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, tap, throwError, Observable } from 'rxjs';

import type { AuthResponse, LoginData, RegisterData, User } from '../models';
import { TokenStorage } from '../interceptors/auth.interceptor';
import { ApiService } from '../core';

// CONSTANTS
const USER_STORAGE_KEY = 'joinly_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly displayName = computed(() => this.currentUserSignal()?.nombre ?? 'Usuario');

  constructor() {
    this.loadUserFromStorage();
  }

  login(data: LoginData): Observable<User> {
    return this.api.post<AuthResponse>('auth/login', data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      map((response) => this.extractUser(response)),
      catchError((error) => this.handleAuthError(error)),
    );
  }

  register(data: RegisterData): Observable<User> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      map((response) => this.extractUser(response)),
      catchError((error) => this.handleAuthError(error)),
    );
  }

  logout(): void {
    TokenStorage.clearTokens();
    this.clearUserFromStorage();
    this.currentUserSignal.set(null);
    this.router.navigate(['/']);
  }

  validateToken(token: string): Observable<boolean> {
    return this.api.get<void>('auth/validate', { params: { token } }).pipe(
      map(() => true),
      catchError(() => [false]),
    );
  }

  checkEmailAvailability(email: string, excludeUserId?: number): Observable<boolean> {
    const params: Record<string, string> = { email };
    if (excludeUserId) params['excludeUserId'] = excludeUserId.toString();

    return this.api.get<{ available: boolean }>('auth/check-email', { params }).pipe(
      map((response) => response.available),
      catchError(() => [false]),
    );
  }

  updateUser(user: User): void {
    this.currentUserSignal.set(user);
    this.saveUserToStorage(user);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    // Solo guardar tokens si la respuesta los contiene
    if (response.accessToken && response.refreshToken) {
      TokenStorage.saveTokens(response);
    }
    const user = this.extractUser(response);
    this.currentUserSignal.set(user);
    this.saveUserToStorage(user);
  }

  private extractUser(response: AuthResponse): User {
    const { id, nombre, email, emailVerificado, temaPreferido, telefono, avatar, fechaRegistro, fechaUltimoAcceso } = response;
    return { id, nombre, email, emailVerificado, temaPreferido, telefono, avatar, fechaRegistro, fechaUltimoAcceso };
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const defaultMessages: Record<number, string> = {
      0: 'Sin conexión al servidor. Verifica que el backend esté ejecutándose.',
      400: 'Datos de registro inválidos',
      401: 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.',
      403: 'No tienes permisos para realizar esta acción.',
      409: 'Este email ya está registrado',
      422: 'Tu cuenta está deshabilitada o bloqueada. Contacta con soporte.',
      500: 'Error interno del servidor',
    };

    const message = error.error?.message 
      ?? (typeof error.error === 'string' ? error.error : defaultMessages[error.status]) 
      ?? 'Error de autenticación';

    return throwError(() => ({ message, status: error.status }));
  }

  private loadUserFromStorage(): void {
    try {
      if (!TokenStorage.hasToken()) return;

      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        this.currentUserSignal.set(JSON.parse(stored) as User);
      }
    } catch {
      this.logout();
    }
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('[AuthService] Error guardando usuario:', error);
    }
  }

  private clearUserFromStorage(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export type { User, LoginData, RegisterData, AuthResponse };
