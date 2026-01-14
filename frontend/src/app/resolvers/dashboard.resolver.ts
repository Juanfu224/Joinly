import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

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

/**
 * Precarga los grupos del usuario antes de activar el dashboard.
 * El spinner global se muestra automáticamente vía LoadingInterceptor.
 */
export const dashboardResolver: ResolveFn<ResolvedData<DashboardData>> = () => {
  const unidadService = inject(UnidadFamiliarService);

  return unidadService.getGruposCards().pipe(
    map((page: Page<GrupoCardData>) =>
      resolveSuccess<DashboardData>({
        grupos: page.content,
        totalElements: page.totalElements,
      })
    ),
    catchError((err) =>
      of(
        resolveError<DashboardData>(
          err.error?.message || 'No se pudieron cargar los grupos. Intenta de nuevo.'
        )
      )
    )
  );
};
