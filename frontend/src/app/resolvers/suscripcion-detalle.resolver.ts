import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of, catchError, map, timeout } from 'rxjs';

import type { SuscripcionDetalle } from '../models';
import { SuscripcionService } from '../services';
import { type ResolvedData, resolveSuccess, resolveError } from './types';

/** Tiempo máximo de espera del resolver (ms) */
const RESOLVER_TIMEOUT = 3000;

/**
 * Precarga suscripción antes de activar la ruta.
 * Timeout de 3s para evitar bloquear navegación.
 */
export const suscripcionDetalleResolver: ResolveFn<ResolvedData<SuscripcionDetalle>> = (route) => {
  const suscripcionService = inject(SuscripcionService);
  const id = Number(route.paramMap.get('id'));

  if (!id || isNaN(id)) {
    return of(resolveError<SuscripcionDetalle>('ID de suscripción inválido'));
  }

  return suscripcionService.getSuscripcionById(id).pipe(
    timeout(RESOLVER_TIMEOUT),
    map((data) => resolveSuccess<SuscripcionDetalle>(data)),
    catchError((err) => {
      // En caso de timeout, dejar que el componente maneje la carga
      if (err.name === 'TimeoutError') {
        return of(resolveError<SuscripcionDetalle>(''));
      }

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
