import { Routes } from '@angular/router';

/** Rutas de desarrollo (sin precarga en producción). */
export const DEV_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/style-guide').then((m) => m.StyleGuideComponent),
    title: 'Guía de Estilos - Joinly',
  },
  {
    path: 'responsive-test',
    loadComponent: () =>
      import('../pages/style-guide/responsive-test').then((m) => m.ResponsiveTestComponent),
    title: 'Testing Responsive - Joinly',
  },
  {
    path: 'navigation-guide',
    loadComponent: () =>
      import('../pages/style-guide/navigation-guide').then((m) => m.NavigationGuideComponent),
    title: 'Guía de Navegación - Joinly',
  },
];
