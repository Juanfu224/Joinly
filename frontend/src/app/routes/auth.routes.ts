import { Routes } from '@angular/router';

/** Rutas de autenticación (login, register). */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/auth/login').then((m) => m.LoginComponent),
    title: 'Iniciar sesión - Joinly',
  },
  {
    path: 'register',
    loadComponent: () => import('../pages/auth/register').then((m) => m.RegisterComponent),
    title: 'Crear cuenta - Joinly',
  },
];
