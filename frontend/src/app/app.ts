import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, MainComponent, FooterComponent } from './layout';
import { AlertContainerComponent } from './components/shared';

/**
 * Componente raíz de la aplicación Joinly.
 * Estructura semántica con Header, Main y Footer.
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
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
