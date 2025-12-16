import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

/**
 * Componente de guía de estilo (Style Guide).
 * Muestra todos los componentes de la aplicación con sus variantes.
 * 
 * Esta página sirve como:
 * - Documentación visual de componentes
 * - Referencia para desarrolladores
 * - Testing rápido de componentes
 * 
 * @usageNotes
 * Accesible en la ruta: `/style-guide`
 */
@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleGuideComponent {}
