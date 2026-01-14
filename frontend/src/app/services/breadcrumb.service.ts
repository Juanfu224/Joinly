import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Data } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { AuthService } from './auth';

/** Representa un elemento en la navegación de migas de pan. */
export interface Breadcrumb {
  label: string;
  url?: string;
}

/** Breadcrumb estático o función que recibe datos de la ruta. */
export type BreadcrumbResolver = string | ((data: Data) => string);

/**
 * Servicio para gestionar breadcrumbs dinámicos.
 *
 * Construye automáticamente la ruta de migas a partir de `data.breadcrumb` en las rutas.
 * Soporta strings estáticos y funciones para datos dinámicos de resolvers.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _breadcrumbs = signal<Breadcrumb[]>([]);
  readonly breadcrumbs = this._breadcrumbs.asReadonly();

  constructor() {
    this.buildBreadcrumbs();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.buildBreadcrumbs());
  }

  private buildBreadcrumbs(): void {
    const breadcrumbs: Breadcrumb[] = [];
    let currentRoute = this.route.root;
    let url = '';

    while (currentRoute.children.length > 0) {
      const childRoute = currentRoute.children.find((child) => child.outlet === 'primary');
      if (!childRoute) break;

      const routeUrl = childRoute.snapshot.url.map((s) => s.path).join('/');
      if (routeUrl) url += `/${routeUrl}`;

      const config = childRoute.snapshot.data['breadcrumb'] as BreadcrumbResolver | undefined;
      if (config) {
        const label = typeof config === 'function' ? config(childRoute.snapshot.data) : config;
        breadcrumbs.push({ label, url });
      }

      currentRoute = childRoute;
    }

    if (breadcrumbs.length > 0) {
      const homeUrl = this.authService.isAuthenticated() ? '/dashboard' : '/';
      breadcrumbs.unshift({ label: 'Inicio', url: homeUrl });
      // Último elemento sin URL (página actual)
      breadcrumbs[breadcrumbs.length - 1] = { label: breadcrumbs[breadcrumbs.length - 1].label };
    }

    this._breadcrumbs.set(breadcrumbs);
  }
}
