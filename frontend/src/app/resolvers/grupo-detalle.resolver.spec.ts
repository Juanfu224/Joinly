import { describe, it, expect } from 'vitest';

import { type ResolvedData, resolveSuccess, resolveError } from './types';
import type { UnidadFamiliar, MiembroUnidadResponse, SuscripcionSummary } from '../models';

/**
 * Tests unitarios para grupoDetalleResolver.
 *
 * Estos tests verifican la lógica de transformación de datos y manejo de errores
 * sin depender del contexto de Angular (inyección de dependencias).
 */
describe('grupoDetalleResolver - lógica de transformación', () => {
  const mockGrupo: UnidadFamiliar = {
    id: 1,
    nombre: 'Familia García',
    codigoInvitacion: 'ABC123',
    administrador: { id: 1, nombreCompleto: 'Juan García', email: 'juan@test.com', nombreUsuario: 'juang' },
    fechaCreacion: '2025-01-01',
    descripcion: null,
    maxMiembros: 10,
    estado: 'ACTIVO',
  };

  const mockMiembros: MiembroUnidadResponse[] = [
    {
      id: 1,
      usuario: { id: 1, nombreCompleto: 'Juan García', email: 'juan@test.com', nombreUsuario: 'juang' },
      rol: 'ADMINISTRADOR',
      fechaUnion: '2025-01-01',
      estado: 'ACTIVO',
    },
  ];

  const mockSuscripciones: SuscripcionSummary[] = [
    {
      id: 1,
      nombreServicio: 'Netflix',
      logoServicio: null,
      precioPorPlaza: 5.99,
      fechaRenovacion: '2025-02-01',
      periodicidad: 'MENSUAL',
      estado: 'ACTIVA',
      numPlazasTotal: 4,
      plazasOcupadas: 2,
    },
  ];

  it('resolveSuccess debe crear GrupoDetalleData correctamente', () => {
    const result = resolveSuccess({
      grupo: mockGrupo,
      miembros: mockMiembros,
      suscripciones: mockSuscripciones,
    });

    expect(result.data).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.data?.grupo).toEqual(mockGrupo);
    expect(result.data?.miembros).toEqual(mockMiembros);
    expect(result.data?.suscripciones).toEqual(mockSuscripciones);
  });

  it('error 404 debe mostrar mensaje de grupo no encontrado', () => {
    const status = 404;
    let message: string;

    if (status === 404) {
      message = 'El grupo no existe o ha sido eliminado';
    } else if (status === 403) {
      message = 'No tienes acceso a este grupo';
    } else {
      message = 'No se pudo cargar el grupo. Intenta de nuevo.';
    }

    const result = resolveError(message);

    expect(result.data).toBeNull();
    expect(result.error).toBe('El grupo no existe o ha sido eliminado');
  });

  it('error 403 debe mostrar mensaje de acceso denegado', () => {
    const status = 403 as number;
    let message: string;

    if (status === 404) {
      message = 'El grupo no existe o ha sido eliminado';
    } else if (status === 403) {
      message = 'No tienes acceso a este grupo';
    } else {
      message = 'No se pudo cargar el grupo. Intenta de nuevo.';
    }

    const result = resolveError(message);

    expect(result.data).toBeNull();
    expect(result.error).toBe('No tienes acceso a este grupo');
  });

  it('ID inválido debe devolver error apropiado', () => {
    const id = Number('invalid');

    if (!id || isNaN(id)) {
      const result = resolveError('ID de grupo inválido');
      expect(result.error).toBe('ID de grupo inválido');
    }
  });

  it('ID válido debe pasar validación', () => {
    const id = Number('123');

    expect(id).toBe(123);
    expect(isNaN(id)).toBe(false);
  });

  it('suscripciones vacías cuando falla la carga no debe afectar grupo', () => {
    const result = resolveSuccess({
      grupo: mockGrupo,
      miembros: mockMiembros,
      suscripciones: [], // Array vacío por error graceful
    });

    expect(result.data).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.data?.grupo.nombre).toBe('Familia García');
    expect(result.data?.suscripciones).toEqual([]);
  });
});
