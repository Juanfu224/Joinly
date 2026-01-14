import type { CanDeactivateFn } from '@angular/router';
import type { CanComponentDeactivate } from './can-component-deactivate';

/**
 * Guard funcional para prevenir navegación cuando hay cambios sin guardar.
 *
 * @usageNotes
 * ```typescript
 * { path: 'crear-grupo', canDeactivate: [pendingChangesGuard], loadComponent: ... }
 * ```
 *
 * @see CanComponentDeactivate
 */
export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  // Permitir si no implementa la interfaz o si el componente lo permite
  if (!component?.canDeactivate || component.canDeactivate()) {
    return true;
  }

  return confirm('Hay cambios sin guardar. ¿Seguro que quieres salir?');
};
