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

/**
 * Componente raíz de la aplicación Joinly.
 * Estructura: header, breadcrumbs, main (router-outlet), footer.
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

  constructor() {
    this.themeService.initialize();
  }
}

