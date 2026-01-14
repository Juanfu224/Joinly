import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Configuración de rutas de la aplicación Joinly.
 *
 * - Lazy loading con `loadComponent` (standalone) y `loadChildren` (grupos)
 * - Rutas protegidas con authGuard
 * - Precarga selectiva: todo excepto dev routes (`data.preload: false`)
 */
export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadComponent: () => import('./pages/home').then((m) => m.HomeComponent),
    title: 'Joinly - Comparte suscripciones con tu familia',
  },
  {
    path: '',
    loadChildren: () => import('./routes/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Páginas institucionales
  {
    path: 'como-funciona',
    loadComponent: () =>
      import('./pages/como-funciona').then((m) => m.ComoFuncionaComponent),
    title: 'Cómo funciona - Joinly',
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq').then((m) => m.FaqComponent),
    title: 'Centro de ayuda - Joinly',
  },
  {
    path: '',
    loadChildren: () => import('./routes/legal.routes').then((m) => m.LEGAL_ROUTES),
  },

  // Rutas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard').then((m) => m.DashboardComponent),
    title: 'Mis Grupos - Joinly',
  },
  {
    path: 'crear-grupo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/crear-grupo').then((m) => m.CrearGrupoComponent),
    title: 'Crear Unidad Familiar - Joinly',
  },
  {
    path: 'unirse-grupo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/unirse-grupo').then((m) => m.UnirseGrupoComponent),
    title: 'Unirse a Grupo - Joinly',
  },
  {
    path: 'grupos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/grupo-detalle').then((m) => m.GrupoDetalleComponent),
    title: 'Detalle del Grupo - Joinly',
  },
  {
    path: 'grupos/:id/crear-suscripcion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/crear-suscripcion').then((m) => m.CrearSuscripcionComponent),
    title: 'Nueva Suscripción - Joinly',
  },

  // Área de usuario
  {
    path: 'usuario',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/usuario').then((m) => m.UsuarioLayoutComponent),
    title: 'Mi cuenta - Joinly',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
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

  // Rutas de desarrollo (sin precarga)
  {
    path: 'style-guide',
    loadChildren: () => import('./routes/dev.routes').then((m) => m.DEV_ROUTES),
    data: { preload: false },
  },

  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./components/shared/not-found').then((m) => m.NotFoundComponent),
    title: 'Página no encontrada - Joinly',
  },
];
