/**
 * Barrel export para resolvers de la aplicación.
 *
 * Los resolvers precargan datos antes de activar las rutas,
 * permitiendo que los componentes reciban datos listos y
 * manejen estados de loading/error de forma controlada.
 *
 * @example
 * ```typescript
 * import {
 *   dashboardResolver,
 *   grupoDetalleResolver,
 *   type ResolvedData
 * } from './resolvers';
 * ```
 */
export { dashboardResolver, type DashboardData } from './dashboard.resolver';
export { grupoDetalleResolver, type GrupoDetalleData } from './grupo-detalle.resolver';
export { type ResolvedData, resolveSuccess, resolveError } from './types';
