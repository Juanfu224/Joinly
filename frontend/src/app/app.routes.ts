import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // =========================================================================
  // RUTAS PÚBLICAS
  // =========================================================================

  // Home - Landing pública
  {
    path: '',
    loadComponent: () => import('./pages/home').then((m) => m.HomeComponent),
    title: 'Joinly - Comparte suscripciones con tu familia',
  },

  // Login
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login').then((m) => m.LoginComponent),
    title: 'Iniciar sesión - Joinly',
  },

  // Register
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register').then((m) => m.RegisterComponent),
    title: 'Crear cuenta - Joinly',
  },

  // =========================================================================
  // RUTAS PROTEGIDAS (Requieren autenticación)
  // =========================================================================

  // Dashboard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard').then((m) => m.DashboardComponent),
    title: 'Mis Grupos - Joinly',
  },

  // =========================================================================
  // RUTAS DE DESARROLLO
  // =========================================================================

  // Style Guide (solo desarrollo)
  {
    path: 'style-guide',
    loadComponent: () =>
      import('./pages/style-guide').then((m) => m.StyleGuideComponent),
    title: 'Guía de Estilos - Joinly',
  },

  // Responsive Test (solo desarrollo - Fase 6)
  {
    path: 'style-guide/responsive-test',
    loadComponent: () =>
      import('./pages/style-guide/responsive-test').then((m) => m.ResponsiveTestComponent),
    title: 'Testing Responsive - Joinly',
  },

  // =========================================================================
  // WILDCARD - Redirige a home
  // =========================================================================
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
