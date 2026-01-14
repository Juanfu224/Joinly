/**
 * Interfaz para componentes que pueden ser desactivados condicionalmente.
 *
 * @usageNotes
 * ```typescript
 * export class MiFormComponent implements CanComponentDeactivate {
 *   canDeactivate(): boolean {
 *     return !this.form.dirty || this.isLoading();
 *   }
 * }
 * ```
 *
 * @see pendingChangesGuard
 */
export interface CanComponentDeactivate {
  /** @returns true si permite navegación, false si hay cambios sin guardar */
  canDeactivate(): boolean;
}
