import { Routes } from '@angular/router';

/** Rutas legales (términos, privacidad). */
export const LEGAL_ROUTES: Routes = [
  {
    path: 'terminos',
    loadComponent: () =>
      import('../pages/legal/terminos').then((m) => m.TerminosComponent),
    title: 'Términos y condiciones - Joinly',
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('../pages/legal/privacidad').then((m) => m.PrivacidadComponent),
    title: 'Política de privacidad - Joinly',
  },
];
