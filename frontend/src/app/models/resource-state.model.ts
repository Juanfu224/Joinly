/**
 * Estados posibles de un recurso HTTP.
 *
 * Estado unificado para gestionar peticiones HTTP en componentes,
 * evitando múltiples signals/variables y simplificando la lógica del template.
 */
export interface ResourceState<T> {
  /** Indica si hay una petición en curso */
  loading: boolean;
  /** Mensaje de error si la petición falló */
  error: string | null;
  /** Datos de la respuesta cuando la petición tuvo éxito */
  data: T | null;
}

/**
 * Estado inicial para recursos no cargados.
 */
export function initialResourceState<T>(): ResourceState<T> {
  return { loading: false, error: null, data: null };
}

/**
 * Estado de recurso en carga.
 */
export function loadingResourceState<T>(): ResourceState<T> {
  return { loading: true, error: null, data: null };
}

/**
 * Estado de recurso con error.
 */
export function errorResourceState<T>(error: string): ResourceState<T> {
  return { loading: false, error, data: null };
}

/**
 * Estado de recurso con datos exitosos.
 */
export function successResourceState<T>(data: T): ResourceState<T> {
  return { loading: false, error: null, data };
}
