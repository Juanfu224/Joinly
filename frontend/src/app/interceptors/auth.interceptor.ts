import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import type { AuthResponse } from '../models';

// CONSTANTS
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'joinly_access_token',
  REFRESH_TOKEN: 'joinly_refresh_token',
  TOKEN_EXPIRY: 'joinly_token_expiry',
} as const;

const PUBLIC_ENDPOINTS: readonly string[] = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/check-email',
  '/api/dev/',
] as const;

const REFRESH_ENDPOINT = '/api/v1/auth/refresh';

// STATE MANAGEMENT
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// HELPER FUNCTIONS
function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

function saveTokens(response: AuthResponse): void {
  if (!response.accessToken || !response.refreshToken) {
    console.error('[TokenStorage] Respuesta sin tokens válidos:', response);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
  const expiresIn = response.expiresIn ?? 3600; // Default 1 hora si no viene
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString());
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  localStorage.removeItem('joinly_user');
}

function addRequestHeaders(req: HttpRequest<unknown>, token?: string | null): HttpRequest<unknown> {
  const headers: Record<string, string> = {};

  // Headers estándar para todas las peticiones (excepto FormData)
  if (!(req.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  }

  // Añadir token si se proporciona
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return Object.keys(headers).length > 0 ? req.clone({ setHeaders: headers }) : req;
}

// MAIN INTERCEPTOR
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Endpoints públicos: solo headers estándar (sin token)
  if (isPublicEndpoint(req.url)) {
    return next(addRequestHeaders(req));
  }

  // Endpoints protegidos: headers estándar + token
  const accessToken = getAccessToken();
  const authReq = addRequestHeaders(req, accessToken);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicEndpoint(req.url)) {
        return handleUnauthorizedError(req, next, router);
      }
      return throwError(() => error);
    }),
  );
};

function handleUnauthorizedError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  router: Router,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // No hay refresh token, hacer logout
      return handleLogout(router);
    }

    // Crear petición de refresh
    const refreshReq = new HttpRequest('POST', REFRESH_ENDPOINT, {
      refreshToken,
    });

    return next(refreshReq as HttpRequest<unknown>).pipe(
      switchMap((event) => {
        // HttpResponse viene en el evento
        if ('body' in event && event.body) {
          const response = event.body as AuthResponse;

          // Guardar nuevos tokens
          saveTokens(response);

          isRefreshing = false;
          refreshTokenSubject.next(response.accessToken);

          // Reintentar petición original con nuevo token
          return next(addRequestHeaders(req, response.accessToken));
        }

        return throwError(() => new Error('Refresh response invalid'));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Refresh falló, hacer logout
        return handleLogout(router);
      }),
    );
  }

  // Ya hay un refresh en progreso, esperar a que complete
  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addRequestHeaders(req, token))),
  );
}

function handleLogout(router: Router): Observable<never> {
  clearTokens();
  isRefreshing = false;
  router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
  return throwError(() => ({ message: 'Sesión expirada' }));
}

// EXPORTED UTILITIES
export const TokenStorage = {
  KEYS: STORAGE_KEYS,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,

  hasToken(): boolean {
    return !!getAccessToken();
  },

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiry) return true;
    return Date.now() >= parseInt(expiry, 10) - 30000;
  },
} as const;
