import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BreadcrumbService, type Breadcrumb } from '../../../services';

// Re-exportar tipo para compatibilidad
export type BreadcrumbItem = Breadcrumb;

/**
 * Componente de navegación de migas de pan (breadcrumbs).
 *
 * Modo automático: obtiene breadcrumbs del servicio (desde `data.breadcrumb` en rutas).
 * Modo manual: usa los items proporcionados via `[items]` (para demos).
 */
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  private readonly breadcrumbService = inject(BreadcrumbService);

  /** Items manuales (prioridad sobre servicio). */
  readonly manualItems = input<Breadcrumb[]>([], { alias: 'items' });

  /** Items a mostrar: manuales si existen, si no del servicio. */
  protected readonly items = computed(() => {
    const manual = this.manualItems();
    return manual.length > 0 ? manual : this.breadcrumbService.breadcrumbs();
  });
}
