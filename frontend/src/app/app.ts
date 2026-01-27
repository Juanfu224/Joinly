import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
import { filter } from 'rxjs';
import {
  ModalComponent,
  ToastContainerComponent,
  SpinnerOverlayComponent,
  InviteModalComponent,
  BreadcrumbsComponent,
} from './components/shared';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { ThemeService } from './services/theme';
import { LoadingService } from './services/loading';
import { BreadcrumbService } from './services';

/**
 * Componente raíz de la aplicación Joinly.
 * Estructura: header, breadcrumbs (condicional), main (router-outlet), footer.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ModalComponent,
    InviteModalComponent,
    ToastContainerComponent,
    SpinnerOverlayComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly breadcrumbService = inject(BreadcrumbService);

  constructor() {
    this.themeService.initialize();

    // Resetear loading en cada navegación para evitar estados bloqueados
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.loadingService.reset();
      });
  }
}
