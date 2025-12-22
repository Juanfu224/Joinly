import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/style-guide').then((m) => m.StyleGuideComponent),
    title: 'Guía de Estilos - Joinly',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
