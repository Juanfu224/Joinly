import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Configuración de rutas de la aplicación Joinly.
 *
 * Estructura:
 * - Rutas públicas: Landing, login, register, páginas institucionales
 * - Rutas protegidas: Dashboard, grupos, suscripciones, área de usuario
 * - Rutas de desarrollo: Style guide
 * - Wildcard: Página 404
 *
 * @remarks
 * - Todas las rutas usan lazy loading para optimizar el bundle inicial
 * - Las rutas protegidas requieren authGuard
 * - Las rutas con parámetros usan Router Input Binding (withComponentInputBinding)
 */
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
  // PÁGINAS INSTITUCIONALES (Públicas)
  // =========================================================================

  // Cómo funciona
  {
    path: 'como-funciona',
    loadComponent: () =>
      import('./pages/como-funciona').then((m) => m.ComoFuncionaComponent),
    title: 'Cómo funciona - Joinly',
  },

  // FAQ / Centro de ayuda
  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faq').then((m) => m.FaqComponent),
    title: 'Centro de ayuda - Joinly',
  },

  // Términos y condiciones
  {
    path: 'terminos',
    loadComponent: () =>
      import('./pages/legal/terminos').then((m) => m.TerminosComponent),
    title: 'Términos y condiciones - Joinly',
  },

  // Política de privacidad
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./pages/legal/privacidad').then((m) => m.PrivacidadComponent),
    title: 'Política de privacidad - Joinly',
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

  // Detalle del Grupo (usa Router Input Binding para :id)
  {
    path: 'grupos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/grupo-detalle').then((m) => m.GrupoDetalleComponent),
    title: 'Detalle del Grupo - Joinly',
  },

  // Crear Suscripción (usa Router Input Binding para :id)
  {
    path: 'grupos/:id/crear-suscripcion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/crear-suscripcion').then((m) => m.CrearSuscripcionComponent),
    title: 'Nueva Suscripción - Joinly',
  },

  // =========================================================================
  // ÁREA DE USUARIO (Rutas hijas anidadas)
  // =========================================================================
  {
    path: 'usuario',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/usuario').then((m) => m.UsuarioLayoutComponent),
    title: 'Mi cuenta - Joinly',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'perfil',
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/usuario/perfil').then((m) => m.PerfilComponent),
        title: 'Mi perfil - Joinly',
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/usuario/configuracion').then((m) => m.ConfiguracionComponent),
        title: 'Configuración - Joinly',
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./pages/usuario/notificaciones').then((m) => m.NotificacionesComponent),
        title: 'Notificaciones - Joinly',
      },
    ],
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

  // Navigation Guide (Fase 4 DWEC - Navegación Programática)
  {
    path: 'style-guide/navigation-guide',
    loadComponent: () =>
      import('./pages/style-guide/navigation-guide').then((m) => m.NavigationGuideComponent),
    title: 'Guía de Navegación - Joinly',
  },

  // =========================================================================
  // WILDCARD - Página 404
  // =========================================================================
  {
    path: '**',
    loadComponent: () =>
      import('./components/shared/not-found').then((m) => m.NotFoundComponent),
    title: 'Página no encontrada - Joinly',
  },
];
