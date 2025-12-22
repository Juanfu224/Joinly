import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AlertContainerComponent,
  ModalComponent,
  ToastContainerComponent,
  SpinnerOverlayComponent,
} from './components/shared';
import { ThemeService } from './services/theme';
import { LoadingService } from './services/loading';

/**
 * Componente raíz de la aplicación Joinly.
 * Versión simplificada que muestra solo la Style Guide.
 * 
 * @remarks
 * Inicializa servicios globales como ThemeService en el constructor.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
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

