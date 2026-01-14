/**
 * Barrel export para guards de la aplicación.
 *
 * @example
 * ```typescript
 * import { authGuard, pendingChangesGuard, type CanComponentDeactivate } from './guards';
 * ```
 */
export { authGuard } from './auth.guard';
export { pendingChangesGuard } from './pending-changes.guard';
export type { CanComponentDeactivate } from './can-component-deactivate';
