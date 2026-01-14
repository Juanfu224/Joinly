import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

/**
 * Precarga grupo, miembros y suscripciones antes de activar la ruta.
 * Las suscripciones fallan graciosamente (array vacío) para no bloquear la vista.
 */
export const grupoDetalleResolver: ResolveFn<ResolvedData<GrupoDetalleData>> = (route) => {
  const unidadService = inject(UnidadFamiliarService);
  const suscripcionService = inject(SuscripcionService);

  const id = Number(route.paramMap.get('id'));

  // Validar ID antes de hacer peticiones
  if (!id || isNaN(id)) {
    return of(resolveError<GrupoDetalleData>('ID de grupo inválido'));
  }

  return forkJoin({
    grupo: unidadService.getGrupoById(id),
    miembros: unidadService.getMiembrosGrupo(id),
    // Suscripciones falla graciosamente - no bloquea la vista del grupo
    suscripciones: suscripcionService.getSuscripcionesGrupo(id).pipe(
      map((page) => page.content),
      catchError(() => of([] as SuscripcionSummary[]))
    ),
  }).pipe(
    map((data) => resolveSuccess<GrupoDetalleData>(data)),
    catchError((err) => {
      // Determinar mensaje según el tipo de error
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
    })
  );
};
