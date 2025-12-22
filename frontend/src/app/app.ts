import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AlertContainerComponent,
  ModalComponent,
  ToastContainerComponent,
  SpinnerOverlayComponent,
} from './components/shared';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { ThemeService } from './services/theme';
import { LoadingService } from './services/loading';

/**
 * Componente raíz de la aplicación Joinly.
 * Proporciona la estructura principal con header, main y footer.
 * 
 * @remarks
 * Inicializa servicios globales como ThemeService en el constructor.
 * Estructura semántica HTML5 completa (header, main, footer).
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
    ToastContainerComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly themeService = inject(ThemeService);
  protected readonly loadingService = inject(LoadingService);

  constructor() {
    // Inicializar servicio de temas al cargar la aplicación
    this.themeService.initialize();
  }
}

