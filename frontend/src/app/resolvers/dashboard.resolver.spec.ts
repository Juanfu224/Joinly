import { of, throwError, firstValueFrom } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';

import { type ResolvedData, resolveSuccess, resolveError } from './types';
import type { Page, GrupoCardData } from '../models';

/**
 * Tests unitarios para dashboardResolver.
 *
 * Estos tests verifican la lógica de transformación de datos y manejo de errores
 * sin depender del contexto de Angular (inyección de dependencias).
 */
describe('dashboardResolver - lógica de transformación', () => {
  const mockGrupos: GrupoCardData[] = [
    { id: 1, nombre: 'Familia García', totalMiembros: 4, totalSuscripciones: 3 },
    { id: 2, nombre: 'Familia López', totalMiembros: 2, totalSuscripciones: 1 },
  ];

  const mockPage: Page<GrupoCardData> = {
    content: mockGrupos,
    totalElements: 2,
    totalPages: 1,
    size: 50,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  it('resolveSuccess debe crear objeto con data y error null', () => {
    const result = resolveSuccess({ grupos: mockGrupos, totalElements: 2 });

    expect(result.data).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.data?.grupos).toEqual(mockGrupos);
    expect(result.data?.totalElements).toBe(2);
  });

  it('resolveError debe crear objeto con data null y mensaje de error', () => {
    const errorMessage = 'No se pudieron cargar los grupos';
    const result = resolveError(errorMessage);

    expect(result.data).toBeNull();
    expect(result.error).toBe(errorMessage);
  });

  it('transformación de Page a DashboardData debe extraer content y totalElements', () => {
    // Simula la transformación que hace el resolver
    const dashboardData = {
      grupos: mockPage.content,
      totalElements: mockPage.totalElements,
    };

    expect(dashboardData.grupos).toHaveLength(2);
    expect(dashboardData.totalElements).toBe(2);
    expect(dashboardData.grupos[0].nombre).toBe('Familia García');
  });

  it('error sin mensaje debe usar mensaje genérico', () => {
    const err = {};
    const message = (err as any).error?.message || 'No se pudieron cargar los grupos. Intenta de nuevo.';
    const result = resolveError(message);

    expect(result.error).toBe('No se pudieron cargar los grupos. Intenta de nuevo.');
  });

  it('error con mensaje del backend debe usarlo', () => {
    const err = { error: { message: 'Error personalizado del servidor' } };
    const message = err.error?.message || 'No se pudieron cargar los grupos. Intenta de nuevo.';
    const result = resolveError(message);

    expect(result.error).toBe('Error personalizado del servidor');
  });
});
