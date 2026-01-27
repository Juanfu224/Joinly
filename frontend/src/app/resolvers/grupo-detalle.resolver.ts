import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of, forkJoin, catchError, map, timeout } from 'rxjs';

import type { UnidadFamiliar, MiembroUnidadResponse, SuscripcionSummary } from '../models';
import { UnidadFamiliarService, SuscripcionService } from '../services';
import { type ResolvedData, resolveSuccess, resolveError } from './types';

/**
 * Datos resueltos para la página de detalle de grupo.
 */
export interface GrupoDetalleData {
  grupo: UnidadFamiliar;
  miembros: MiembroUnidadResponse[];
  suscripciones: SuscripcionSummary[];
}

/** Tiempo máximo de espera del resolver (ms) */
const RESOLVER_TIMEOUT = 3000;

/**
 * Precarga grupo y miembros antes de activar la ruta.
 * Timeout de 3s para evitar bloquear navegación.
 * Las suscripciones se cargan en el componente para no bloquear.
 */
export const grupoDetalleResolver: ResolveFn<ResolvedData<GrupoDetalleData>> = (route) => {
  const unidadService = inject(UnidadFamiliarService);

  const id = Number(route.paramMap.get('id'));

  // Validar ID antes de hacer peticiones
  if (!id || isNaN(id)) {
    return of(resolveError<GrupoDetalleData>('ID de grupo inválido'));
  }

  // Solo cargar grupo y miembros (rápido), suscripciones se cargan en componente
  return forkJoin({
    grupo: unidadService.getGrupoById(id),
    miembros: unidadService.getMiembrosGrupo(id),
  }).pipe(
    timeout(RESOLVER_TIMEOUT),
    map((data) =>
      resolveSuccess<GrupoDetalleData>({
        ...data,
        suscripciones: [], // Se cargan en el componente
      }),
    ),
    catchError((err) => {
      // En caso de timeout, dejar que el componente maneje la carga
      if (err.name === 'TimeoutError') {
        return of(resolveError<GrupoDetalleData>(''));
      }

      const status = err.status;
      let message: string;

      if (status === 404) {
        message = 'El grupo no existe o ha sido eliminado';
      } else if (status === 403) {
        message = 'No tienes acceso a este grupo';
      } else {
        message = err.error?.message || 'No se pudo cargar el grupo. Intenta de nuevo.';
      }

      return of(resolveError<GrupoDetalleData>(message));
    }),
  );
};
