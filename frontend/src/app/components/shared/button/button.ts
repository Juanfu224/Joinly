import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICON_PATHS, type IconName } from '../icon/icon-paths';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'purple' | 'blue' | 'yellow';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Componente Button - Sistema de botones basado en diseño Figma.
 *
 * Implementa el sistema de botones del diseño con 5 variantes de color,
 * 5 tamaños, iconos opcionales y estados interactivos.
 *
 * @usageNotes
 * ```html
 * <!-- Botón básico -->
 * <app-button>Botón</app-button>
 *
 * <!-- Botón con iconos -->
 * <app-button variant="purple" leftIcon="add" rightIcon="arrow-right">Botón</app-button>
 *
 * <!-- Botón de tamaño específico -->
 * <app-button size="lg" variant="blue">Botón Grande</app-button>
 * ```
 *
 * ### Variantes
 * - primary: Naranja (acción principal)
 * - purple: Morado (acción destacada)
 * - blue: Azul (acción secundaria)
 * - yellow: Amarillo (acción de advertencia)
 * - secondary: Transparente con borde (acción terciaria)
 * - ghost: Transparente sin borde (acción sutil)
 *
 * ### Tamaños
 * - xs: Muy pequeño (24px altura, 8px texto)
 * - sm: Pequeño (32px altura, 12px texto)
 * - md: Mediano (40px altura, 14px texto)
 * - lg: Grande (48px altura, 16px texto)
 * - xl: Muy grande (64px altura, 24px texto)
 */
@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Variante visual del botón */
  variant = input<ButtonVariant>('primary');
  
  /** Tamaño del botón */
  size = input<ButtonSize>('md');
  
  /** Tipo de botón HTML */
  type = input<ButtonType>('button');
  
  /** Estado deshabilitado */
  disabled = input<boolean>(false);
  
  /** Estado de carga (muestra spinner y deshabilita) */
  loading = input<boolean>(false);
  
  /** Ocupa todo el ancho disponible */
  fullWidth = input<boolean>(false);
  
  /** Icono a la izquierda del texto */
  leftIcon = input<IconName | undefined>(undefined);
  
  /** Icono a la derecha del texto */
  rightIcon = input<IconName | undefined>(undefined);

  /** Etiqueta accesible para lectores de pantalla (aria-label) */
  ariaLabel = input<string | undefined>(undefined);

  /** Clases CSS computadas */
  buttonClasses = computed(() => {
    const classes = [
      'c-button',
      `c-button--${this.variant()}`,
      `c-button--${this.size()}`,
    ];

    if (this.fullWidth()) {
      classes.push('c-button--full-width');
    }

    if (this.loading()) {
      classes.push('c-button--loading');
    }

    return classes.join(' ');
  });

  /** Computed que combina disabled y loading */
  isDisabled = computed(() => this.disabled() || this.loading());

  /** Mapeo de tamaños de botón a tamaños de icono */
  private readonly iconSizeMap: Record<ButtonSize, number> = {
    xs: 10,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 26,
  } as const;

  /** Tamaño del icono según el tamaño del botón */
  iconSize = computed(() => this.iconSizeMap[this.size()]);

  /** Path SVG del icono izquierdo */
  leftIconPath = computed(() => {
    const icon = this.leftIcon();
    return icon ? this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[icon] ?? '') : null;
  });

  /** Path SVG del icono derecho */
  rightIconPath = computed(() => {
    const icon = this.rightIcon();
    return icon ? this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[icon] ?? '') : null;
  });
}
