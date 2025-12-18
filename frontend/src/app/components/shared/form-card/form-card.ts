import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

type LogoVariant = 'naranja' | 'morado' | 'azul';

/**
 * Componente contenedor base para formularios.
 * Proporciona la estructura visual común: card con logo, título, subtítulo y contenido.
 * 
 * @usageNotes
 * ```html
 * <app-form-card 
 *   title="Regístrate para empezar a organizar"
 *   subtitle="tus suscripciones"
 *   logoVariant="naranja"
 * >
 *   <!-- Contenido del formulario -->
 * </app-form-card>
 * ```
 */
@Component({
  selector: 'app-form-card',
  standalone: true,
  templateUrl: './form-card.html',
  styleUrl: './form-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-card' },
})
export class FormCardComponent {
  /** Título principal del formulario */
  readonly title = input.required<string>();
  
  /** Subtítulo opcional (aparece debajo del título) */
  readonly subtitle = input<string>('');
  
  /** Descripción adicional (aparece bajo el subtítulo con estilo más claro) */
  readonly description = input<string>('');
  
  /** Variante de color del logo */
  readonly logoVariant = input<LogoVariant>('naranja');
}
