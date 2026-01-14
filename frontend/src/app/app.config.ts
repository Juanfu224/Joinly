import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor, loadingInterceptor } from './interceptors';
import { SelectivePreloadStrategy } from './strategies';

/**
 * Configuración de la aplicación Angular.
 *
 * @remarks
 * - `withComponentInputBinding()`: Habilita Router Inputs para pasar parámetros de ruta
 *   directamente como inputs del componente (Angular 21 best practice).
 * - `withViewTransitions()`: Habilita transiciones suaves entre vistas.
 * - `withPreloading(SelectivePreloadStrategy)`: Precarga rutas lazy en segundo plano,
 *   excepto aquellas marcadas con `data.preload: false` (ej: rutas de desarrollo).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withPreloading(SelectivePreloadStrategy)
    ),
    provideHttpClient(
      withFetch(),
      // Orden importante: auth primero (añade token), loading después (muestra spinner)
      withInterceptors([authInterceptor, loadingInterceptor])
    ),
  ]
};
