import { Routes, Data } from '@angular/router';
import { authGuard, pendingChangesGuard, homeGuard } from './guards';
import { dashboardResolver, grupoDetalleResolver, suscripcionDetalleResolver } from './resolvers';
import type { ResolvedData, GrupoDetalleData } from './resolvers';
import type { SuscripcionDetalle } from './models';

/**
 * Configuración de rutas de la aplicación Joinly.
 *
 * - Lazy loading con `loadComponent` (standalone) y `loadChildren` (grupos)
 * - Rutas protegidas con authGuard (autenticación)
 * - Rutas con pendingChangesGuard (formularios con cambios sin guardar)
 * - Precarga selectiva: todo excepto dev routes (`data.preload: false`)
 * - Breadcrumbs dinámicos con `data.breadcrumb` (string o función)
 */
export const routes: Routes = [
  // Rutas públicas (sin breadcrumbs)
  {
    path: '',
    canActivate: [homeGuard],
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
    data: { breadcrumb: 'Cómo funciona' },
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq').then((m) => m.FaqComponent),
    title: 'Centro de ayuda - Joinly',
    data: { breadcrumb: 'Centro de ayuda' },
  },
  {
    path: '',
    loadChildren: () => import('./routes/legal.routes').then((m) => m.LEGAL_ROUTES),
  },

  // Rutas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    resolve: { dashboardData: dashboardResolver },
    loadComponent: () =>
      import('./pages/dashboard').then((m) => m.DashboardComponent),
    title: 'Mis Grupos - Joinly',
    data: { breadcrumb: 'Mis Grupos' },
  },
  {
    path: 'crear-grupo',
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard],
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
    resolve: { grupoData: grupoDetalleResolver },
    loadComponent: () =>
      import('./pages/grupo-detalle').then((m) => m.GrupoDetalleComponent),
    title: 'Detalle del Grupo - Joinly',
    data: {
      breadcrumbParent: {
        label: 'Mis Grupos',
        url: '/dashboard',
      },
      breadcrumb: (data: Data) => {
        const resolved = data['grupoData'] as ResolvedData<GrupoDetalleData> | undefined;
        return resolved?.data?.grupo?.nombre ?? 'Grupo';
      },
    },
  },
  {
    path: 'grupos/:id/crear-suscripcion',
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard],
    resolve: { grupoData: grupoDetalleResolver },
    loadComponent: () =>
      import('./pages/crear-suscripcion').then((m) => m.CrearSuscripcionComponent),
    title: 'Nueva Suscripción - Joinly',
    data: {
      breadcrumbParent: [
        {
          label: 'Mis Grupos',
          url: '/dashboard',
        },
        {
          label: (data: Data) => {
            const resolved = data['grupoData'] as ResolvedData<GrupoDetalleData> | undefined;
            return resolved?.data?.grupo?.nombre ?? 'Grupo';
          },
          url: (params: Record<string, string>) => `/grupos/${params['id']}`,
        },
      ],
      breadcrumb: 'Nueva Suscripción',
    },
  },
  {
    path: 'grupos/:grupoId/suscripciones/:id',
    canActivate: [authGuard],
    resolve: { suscripcionData: suscripcionDetalleResolver },
    loadComponent: () =>
      import('./pages/suscripcion-detalle').then((m) => m.SuscripcionDetalleComponent),
    title: 'Detalle de Suscripción - Joinly',
    data: {
      breadcrumbParent: [
        {
          label: 'Mis Grupos',
          url: '/dashboard',
        },
        {
          label: (data: Data) => {
            const resolved = data['suscripcionData'] as ResolvedData<SuscripcionDetalle> | undefined;
            return resolved?.data?.nombreUnidad ?? 'Grupo';
          },
          url: (params: Record<string, string>) => `/grupos/${params['grupoId']}`,
        },
      ],
      breadcrumb: (data: Data) => {
        const resolved = data['suscripcionData'] as ResolvedData<SuscripcionDetalle> | undefined;
        return resolved?.data?.servicio.nombre ?? 'Suscripción';
      },
    },
  },

  // Área de usuario
  {
    path: 'usuario',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/usuario').then((m) => m.UsuarioLayoutComponent),
    title: 'Mi cuenta - Joinly',
    data: { breadcrumb: 'Mi Cuenta' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/usuario/perfil').then((m) => m.PerfilComponent),
        title: 'Mi perfil - Joinly',
        data: { breadcrumb: 'Perfil' },
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/usuario/configuracion').then((m) => m.ConfiguracionComponent),
        title: 'Configuración - Joinly',
        data: { breadcrumb: 'Configuración' },
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./pages/usuario/notificaciones').then((m) => m.NotificacionesComponent),
        title: 'Notificaciones - Joinly',
        data: { breadcrumb: 'Notificaciones' },
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./pages/usuario/mis-solicitudes').then((m) => m.MisSolicitudesComponent),
        title: 'Mis Solicitudes - Joinly',
        data: { breadcrumb: 'Solicitudes' },
      },
    ],
  },

  // Rutas de desarrollo (sin precarga, sin breadcrumbs)
  {
    path: 'style-guide',
    loadChildren: () => import('./routes/dev.routes').then((m) => m.DEV_ROUTES),
    data: { preload: false },
  },

  // 404 (sin breadcrumbs)
  {
    path: '**',
    loadComponent: () =>
      import('./components/shared/not-found').then((m) => m.NotFoundComponent),
    title: 'Página no encontrada - Joinly',
  },
];
