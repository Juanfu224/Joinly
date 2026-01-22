import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';

/**
 * Estrategia de precarga inteligente que considera:
 * 1. Rutas marcadas con `data.preload: false` se omiten
 * 2. Conexiones lentas (2G/slow-2g) no precargan para ahorrar datos
 * 3. Modo data-saver del usuario se respeta
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  private readonly platformId = inject(PLATFORM_ID);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    // No precargar rutas marcadas explícitamente
    if (route.data?.['preload'] === false) {
      return of(null);
    }

    // En SSR, siempre precargar
    if (!isPlatformBrowser(this.platformId)) {
      return load();
    }

    // Verificar condiciones de red
    if (this.shouldSkipPreload()) {
      return EMPTY;
    }

    return load();
  }

  /**
   * Determina si se debe omitir la precarga basándose en las condiciones de red.
   */
  private shouldSkipPreload(): boolean {
    // Verificar API de Network Information (experimental)
    const connection = (navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        saveData?: boolean;
      };
    }).connection;

    if (connection) {
      // Omitir en conexiones lentas
      const slowConnections = ['slow-2g', '2g'];
      if (connection.effectiveType && slowConnections.includes(connection.effectiveType)) {
        return true;
      }

      // Respetar preferencia de ahorro de datos del usuario
      if (connection.saveData) {
        return true;
      }
    }

    return false;
  }
}
