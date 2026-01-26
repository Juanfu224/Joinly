import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_PATHS, type IconName } from './icon-paths';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

/**
 * Componente Icon - Sistema centralizado de iconos SVG.
 *
 * Proporciona acceso a todos los iconos del diseño de Figma de forma optimizada,
 * manteniendo consistencia visual y facilidad de uso en toda la aplicación.
 *
 * @usageNotes
 * ```html
 * <!-- Icono básico -->
 * <app-icon name="home" />
 *
 * <!-- Icono con tamaño personalizado -->
 * <app-icon name="user" size="lg" />
 *
 * <!-- Icono con clase CSS adicional -->
 * <app-icon name="search" customClass="mi-clase" />
 * ```
 *
 * ### Características
 * - Librería completa de iconos del sistema de diseño
 * - Tamaños predefinidos: xs (16px), sm (20px), md (24px), lg (28px), xl (32px)
 * - SVGs inline para mejor rendimiento
 * - Heredan el color del texto padre (currentColor)
 * - Accesibles por defecto (aria-hidden="true")
 * - OnPush change detection para máxima eficiencia
 *
 * @see {@link IconName} para la lista completa de iconos disponibles
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="sizeInPixels()"
      [attr.height]="sizeInPixels()"
      [class]="computedClasses()"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      [innerHTML]="sanitizedIconPath()"
    ></svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    svg {
      display: block;
      color: inherit;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Nombre del icono a mostrar */
  readonly name = input.required<IconName>();

  /** Tamaño del icono: xs (16px), sm (20px), md (24px), lg (28px), xl (32px) */
  readonly size = input<IconSize>('md');

  /** Clase CSS adicional para personalización */
  readonly customClass = input<string>('');

  /** Path SVG del icono seleccionado */
  private readonly iconPath = computed(() => ICON_PATHS[this.name()] ?? '');

  /** Path SVG sanitizado para inyección segura */
  protected readonly sanitizedIconPath = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.iconPath()),
  );

  /** Tamaño en píxeles basado en la variante */
  protected readonly sizeInPixels = computed(() => SIZE_MAP[this.size()]);

  /** Clases CSS computadas */
  protected readonly computedClasses = computed(() => {
    const custom = this.customClass();
    return custom ? `c-icon ${custom}` : 'c-icon';
  });
}
