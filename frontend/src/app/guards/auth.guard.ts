import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard funcional para proteger rutas que requieren autenticación.
 *
 * Si el usuario no está autenticado, redirige a /login
 * y guarda la URL original en queryParams para redirigir después del login.
 *
 * @usageNotes
 * ```typescript
 * // En app.routes.ts
 * {
 *   path: 'dashboard',
 *   canActivate: [authGuard],
 *   loadComponent: () => import('./pages/dashboard').then(m => m.DashboardComponent)
 * }
 * ```
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirige a login con returnUrl
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
