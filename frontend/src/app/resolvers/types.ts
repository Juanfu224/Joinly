/**
 * Wrapper genérico para datos resueltos por resolvers.
 * Permite distinguir entre carga exitosa (data) y error (mensaje).
 */
export interface ResolvedData<T> {
  data: T | null;
  error: string | null;
}

/** Crea resultado exitoso */
export function resolveSuccess<T>(data: T): ResolvedData<T> {
  return { data, error: null };
}

/** Crea resultado de error */
export function resolveError<T>(message: string): ResolvedData<T> {
  return { data: null, error: message };
}
