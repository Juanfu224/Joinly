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

  // Crear Grupo
  {
    path: 'crear-grupo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/crear-grupo').then((m) => m.CrearGrupoComponent),
    title: 'Crear Unidad Familiar - Joinly',
  },

  // Unirse Grupo
  {
    path: 'unirse-grupo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/unirse-grupo').then((m) => m.UnirseGrupoComponent),
    title: 'Unirse a Grupo - Joinly',
  },

  // Detalle del Grupo
  {
    path: 'grupos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/grupo-detalle').then((m) => m.GrupoDetalleComponent),
    title: 'Detalle del Grupo - Joinly',
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
