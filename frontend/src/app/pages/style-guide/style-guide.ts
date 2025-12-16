import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { CardComponent, ButtonComponent } from '../../components/shared';

/**
 * Componente Style Guide - Guía visual del sistema de diseño.
 * 
 * Muestra todos los componentes reutilizables de la aplicación con sus variantes,
 * sirviendo como documentación visual y herramienta de testing.
 * 
 * @see /style-guide - Ruta de acceso al componente
 * 
 * @usageNotes
 * Este componente es útil para:
 * - Documentación visual del sistema de diseño
 * - Referencia rápida para desarrolladores
 * - Testing visual de componentes
 * - Validación de consistencia del diseño
 */
@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CardComponent, ButtonComponent],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleGuideComponent {}
