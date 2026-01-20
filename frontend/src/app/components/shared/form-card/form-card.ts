import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { LogoComponent, type LogoVariant } from '../logo/logo';
import { ThemeService } from '../../../services/theme';

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
  imports: [LogoComponent],
  templateUrl: './form-card.html',
  styleUrl: './form-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-card' },
})
export class FormCardComponent {
  private readonly themeService = inject(ThemeService);

  /** Título principal del formulario */
  readonly title = input.required<string>();
  
  /** Subtítulo opcional (aparece debajo del título) */
  readonly subtitle = input<string>('');
  
  /** Descripción adicional (aparece bajo el subtítulo con estilo más claro) */
  readonly description = input<string>('');
  
  /** Variante de color del logo (base, se adaptará según el tema) */
  readonly logoVariant = input<LogoVariant>('naranja');

  /** Variante del logo computada según el tema actual */
  readonly computedLogoVariant = computed<LogoVariant>(() => {
    const isDark = this.themeService.currentTheme() === 'dark';
    const baseVariant = this.logoVariant();
    
    if (!isDark) return baseVariant;
    
    // En modo oscuro, usar las variantes claras
    if (baseVariant === 'naranja') return 'claro-naranja';
    if (baseVariant === 'morado') return 'claro-morado';
    if (baseVariant === 'azul') return 'claro-azul';
    
    return baseVariant;
  });
}
