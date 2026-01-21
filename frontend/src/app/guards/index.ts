/**
 * Barrel export para guards de la aplicación.
 *
 * @example
 * ```typescript
 * import { authGuard, homeGuard, pendingChangesGuard, type CanComponentDeactivate } from './guards';
 * ```
 */
export { authGuard } from './auth.guard';
export { homeGuard } from './home.guard';
export { pendingChangesGuard } from './pending-changes.guard';
export type { CanComponentDeactivate } from './can-component-deactivate';
