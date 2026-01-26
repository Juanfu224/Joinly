import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of, catchError, map } from 'rxjs';

import type { SuscripcionDetalle } from '../models';
import { SuscripcionService } from '../services';
import { type ResolvedData, resolveSuccess, resolveError } from './types';

export const suscripcionDetalleResolver: ResolveFn<ResolvedData<SuscripcionDetalle>> = (route) => {
  const suscripcionService = inject(SuscripcionService);
  const id = Number(route.paramMap.get('id'));

  if (!id || isNaN(id)) {
    return of(resolveError<SuscripcionDetalle>('ID de suscripción inválido'));
  }

  return suscripcionService.getSuscripcionById(id).pipe(
    map((data) => resolveSuccess<SuscripcionDetalle>(data)),
    catchError((err) => {
      const status = err.status;
      let message: string;

      if (status === 404) {
        message = 'La suscripción no existe o ha sido eliminada';
      } else if (status === 403) {
        message = 'No tienes acceso a esta suscripción';
      } else {
        message = err.error?.message || 'No se pudo cargar la suscripción. Intenta de nuevo.';
      }

      return of(resolveError<SuscripcionDetalle>(message));
    }),
  );
};
