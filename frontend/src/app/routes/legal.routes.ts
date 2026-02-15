import { Routes } from '@angular/router';

/** Rutas legales (términos, privacidad, accesibilidad). */
export const LEGAL_ROUTES: Routes = [
  {
    path: 'terminos',
    loadComponent: () => import('../pages/legal/terminos').then((m) => m.TerminosComponent),
    title: 'Términos y condiciones - Joinly',
  },
  {
    path: 'privacidad',
    loadComponent: () => import('../pages/legal/privacidad').then((m) => m.PrivacidadComponent),
    title: 'Política de privacidad - Joinly',
  },
  {
    path: 'accesibilidad',
    loadComponent: () => import('../pages/legal/accesibilidad').then((m) => m.AccesibilidadComponent),
    title: 'Declaración de Accesibilidad - Joinly',
  },
];
