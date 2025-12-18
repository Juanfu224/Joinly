import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

/**
 * Variantes de color disponibles para el logotipo.
 * Coinciden con las definidas en el diseño de Figma.
 */
export type LogoVariant = 'naranja' | 'morado' | 'claro-naranja' | 'claro-morado' | 'azul' | 'amarillo';

/**
 * Tamaños disponibles para el logotipo.
 */
export type LogoSize = 'sm' | 'md' | 'lg';

/**
 * Componente Logo - Joinly
 *
 * Logotipo reutilizable con soporte para múltiples variantes de color y tamaños.
 * Implementa el diseño de Figma con SVG optimizado y texto estilizado.
 *
 * ### Características
 * - 6 variantes de color según paleta de Figma
 * - 3 tamaños: sm (24px), md (33px), lg (42px)
 * - Opción para ocultar texto (solo icono)
 * - SVG inline optimizado sin dependencias externas
 * - OnPush change detection para máximo rendimiento
 *
 * @example
 * ```html
 * <!-- Logo naranja por defecto -->
 * <app-logo />
 *
 * <!-- Logo morado tamaño grande -->
 * <app-logo variant="morado" size="lg" />
 *
 * <!-- Solo icono (sin texto) -->
 * <app-logo [showText]="false" />
 *
 * <!-- Para footer (fondo oscuro) -->
 * <app-logo variant="claro-naranja" />
 * ```
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'c-logo',
    '[class.c-logo--naranja]': 'variant() === "naranja"',
    '[class.c-logo--morado]': 'variant() === "morado"',
    '[class.c-logo--claro-naranja]': 'variant() === "claro-naranja"',
    '[class.c-logo--claro-morado]': 'variant() === "claro-morado"',
    '[class.c-logo--azul]': 'variant() === "azul"',
    '[class.c-logo--amarillo]': 'variant() === "amarillo"',
    '[class.c-logo--sm]': 'size() === "sm"',
    '[class.c-logo--md]': 'size() === "md"',
    '[class.c-logo--lg]': 'size() === "lg"',
  },
})
export class LogoComponent {
  /** Variante de color del logotipo */
  readonly variant = input<LogoVariant>('naranja');

  /** Tamaño del logotipo */
  readonly size = input<LogoSize>('md');

  /** Mostrar el texto "Joinly" junto al icono */
  readonly showText = input<boolean>(true);

  /** Determina si es una variante clara (para fondos oscuros) */
  readonly isLightVariant = computed(() =>
    ['claro-naranja', 'claro-morado'].includes(this.variant())
  );
}
