import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, MainComponent, FooterComponent } from './layout';
import { AlertContainerComponent, ModalComponent } from './components/shared';
import { ThemeService } from './services/theme';

/**
 * Componente raíz de la aplicación Joinly.
 * Estructura semántica con Header, Main y Footer.
 * 
 * @remarks
 * Inicializa servicios globales como ThemeService en el constructor.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    MainComponent,
    FooterComponent,
    AlertContainerComponent,
    ModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly themeService = inject(ThemeService);

  constructor() {
    // Inicializar servicio de temas al cargar la aplicación
    this.themeService.initialize();
  }
}

