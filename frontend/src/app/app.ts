import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AlertContainerComponent,
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
    AlertContainerComponent,
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
  private readonly themeService = inject(ThemeService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly breadcrumbService = inject(BreadcrumbService);

  constructor() {
    this.themeService.initialize();
  }
}

