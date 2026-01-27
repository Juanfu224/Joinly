import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of, catchError, map, timeout } from 'rxjs';

import type { GrupoCardData, Page } from '../models';
import { UnidadFamiliarService } from '../services';
import { type ResolvedData, resolveSuccess, resolveError } from './types';

/**
 * Datos resueltos para el dashboard.
 */
export interface DashboardData {
  grupos: GrupoCardData[];
  totalElements: number;
}

/** Tiempo máximo de espera del resolver (ms) - evita bloqueo prolongado */
const RESOLVER_TIMEOUT = 3000;

/**
 * Precarga los grupos del usuario antes de activar el dashboard.
 * Timeout de 3s para evitar bloquear la navegación demasiado tiempo.
 * En caso de timeout o error, permite la navegación y el componente cargará.
 */
export const dashboardResolver: ResolveFn<ResolvedData<DashboardData>> = () => {
  const unidadService = inject(UnidadFamiliarService);

  return unidadService.getGruposCards().pipe(
    timeout(RESOLVER_TIMEOUT),
    map((page: Page<GrupoCardData>) =>
      resolveSuccess<DashboardData>({
        grupos: page.content,
        totalElements: page.totalElements,
      }),
    ),
    catchError(() =>
      // En caso de error o timeout, devolver vacío - el componente cargará
      of(resolveSuccess<DashboardData>({ grupos: [], totalElements: 0 })),
    ),
  );
};
