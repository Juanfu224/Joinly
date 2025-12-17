import {
  Directive,
  ElementRef,
  HostListener,
  input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Directiva para mostrar tooltips informativos en elementos interactivos.
 *
 * **Características:**
 * - Posicionamiento dinámico con detección de espacio disponible
 * - Delay de 250ms antes de mostrar (mejora UX)
 * - Cancelación automática si el mouse sale antes del delay
 * - Soporte para navegación con teclado (focus/blur)
 * - Animación fade-in/fade-out
 * - Flecha apuntando al elemento
 * - Accesible con ARIA (role="tooltip", aria-describedby)
 *
 * @usageNotes
 * ```html
 * <!-- Tooltip básico (posición automática: arriba por defecto) -->
 * <button appTooltip="Texto del tooltip">Botón</button>
 *
 * <!-- Tooltip con posición específica -->
 * <button appTooltip="Guardar cambios" tooltipPosition="right">
 *   <app-icon name="save" />
 * </button>
 *
 * <!-- Tooltip en icono -->
 * <app-icon name="info" appTooltip="Información adicional" />
 * ```
 *
 * @remarks
 * El tooltip se posiciona automáticamente según el espacio disponible.
 * Orden de prioridad: top → bottom → left → right.
 * 
 * Manipula el DOM directamente usando Renderer2 para:
 * - Crear elemento tooltip dinámicamente
 * - Calcular posición óptima con getBoundingClientRect()
 * - Aplicar estilos inline para posicionamiento
 * - Gestionar atributos ARIA para accesibilidad
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * Texto a mostrar en el tooltip (requerido)
   */
  readonly text = input.required<string>({ alias: 'appTooltip' });

  /**
   * Posición preferida del tooltip (si hay espacio)
   * @default 'top'
   */
  readonly position = input<TooltipPosition>('top', { alias: 'tooltipPosition' });

  /**
   * Elemento DOM del tooltip (creado dinámicamente)
   */
  private tooltipElement?: HTMLElement;

  /**
   * Timeout para el delay de mostrar tooltip
   */
  private showTimeout?: number;

  /**
   * ID único para vinculación ARIA
   */
  private readonly tooltipId = `tooltip-${crypto.randomUUID().slice(0, 8)}`;

  /**
   * Espaciado entre el tooltip y el elemento (en píxeles)
   */
  private readonly TOOLTIP_OFFSET = 12;

  /**
   * Delay antes de mostrar el tooltip (en milisegundos)
   */
  private readonly SHOW_DELAY = 250;

  /**
   * Muestra el tooltip con delay al pasar el mouse.
   * El delay mejora la UX evitando tooltips molestos en movimientos rápidos.
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTimeout = window.setTimeout(() => {
      this.show();
    }, this.SHOW_DELAY);
  }

  /**
   * Oculta el tooltip y cancela el timeout si el mouse sale antes del delay.
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.showTimeout) {
      window.clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    this.hide();
  }

  /**
   * Muestra el tooltip cuando el elemento recibe foco (accesibilidad de teclado).
   */
  @HostListener('focus')
  onFocus(): void {
    this.show();
  }

  /**
   * Oculta el tooltip cuando el elemento pierde el foco.
   */
  @HostListener('blur')
  onBlur(): void {
    this.hide();
  }

  ngOnDestroy(): void {
    // Limpiar timeout si existe
    if (this.showTimeout) {
      window.clearTimeout(this.showTimeout);
    }
    // Eliminar tooltip del DOM si existe
    this.destroyTooltip();
  }

  /**
   * Crea y muestra el tooltip con posicionamiento dinámico.
   * Calcula la mejor posición según el espacio disponible en el viewport.
   */
  private show(): void {
    if (this.tooltipElement || !this.text()) {
      return;
    }

    // Crear elemento tooltip
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'c-tooltip');
    this.renderer.setAttribute(this.tooltipElement, 'role', 'tooltip');
    this.renderer.setAttribute(this.tooltipElement, 'id', this.tooltipId);

    // Añadir texto
    const textNode = this.renderer.createText(this.text());
    this.renderer.appendChild(this.tooltipElement, textNode);

    // Añadir flecha
    const arrow = this.renderer.createElement('span');
    this.renderer.addClass(arrow, 'c-tooltip__flecha');
    this.renderer.appendChild(this.tooltipElement, arrow);

    // Añadir al body (necesario para posicionamiento absoluto global)
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Añadir atributo ARIA al elemento host
    this.renderer.setAttribute(
      this.el.nativeElement,
      'aria-describedby',
      this.tooltipId
    );

    // Calcular y aplicar posición
    this.positionTooltip();

    // Aplicar clase de visible (trigger animación CSS)
    // Usar setTimeout para permitir que el navegador renderice el elemento primero
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'c-tooltip--visible');
      }
    }, 10);
  }

  /**
   * Oculta y destruye el tooltip con animación.
   */
  private hide(): void {
    if (!this.tooltipElement) {
      return;
    }

    // Remover clase visible (trigger animación de salida)
    this.renderer.removeClass(this.tooltipElement, 'c-tooltip--visible');

    // Esperar a que termine la animación antes de destruir
    setTimeout(() => {
      this.destroyTooltip();
    }, 150); // Duración de la animación fade-out
  }

  /**
   * Elimina el tooltip del DOM y limpia referencias.
   */
  private destroyTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = undefined;
    }

    // Remover atributo ARIA
    this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
  }

  /**
   * Calcula y aplica la posición óptima del tooltip.
   * 
   * @remarks
   * Estrategia de posicionamiento:
   * 1. Obtener dimensiones del elemento host y del tooltip
   * 2. Calcular posición para la posición preferida
   * 3. Verificar si hay espacio suficiente en el viewport
   * 4. Si no hay espacio, probar posiciones alternativas en orden de prioridad
   * 5. Aplicar estilos inline para posicionar el tooltip
   * 6. Ajustar posición de la flecha según la posición final
   */
  private positionTooltip(): void {
    if (!this.tooltipElement) {
      return;
    }

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Intentar posicionar según preferencia, con fallback a otras posiciones
    const positions: TooltipPosition[] = [
      this.position(),
      'top',
      'bottom',
      'left',
      'right',
    ];

    let finalPosition: TooltipPosition | null = null;

    for (const pos of positions) {
      const coords = this.calculatePosition(pos, hostRect, tooltipRect);

      // Verificar si la posición cabe en el viewport
      if (this.fitsInViewport(coords, tooltipRect, viewportWidth, viewportHeight)) {
        finalPosition = pos;
        
        // Aplicar posición
        this.renderer.setStyle(
          this.tooltipElement,
          'top',
          `${coords.top + scrollY}px`
        );
        this.renderer.setStyle(
          this.tooltipElement,
          'left',
          `${coords.left + scrollX}px`
        );
        
        // Aplicar clase de posición para la flecha
        this.renderer.addClass(this.tooltipElement, `c-tooltip--${pos}`);
        break;
      }
    }

    // Fallback: centrar si ninguna posición funciona
    if (!finalPosition) {
      const centerTop = hostRect.top - tooltipRect.height - this.TOOLTIP_OFFSET;
      const centerLeft = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
      
      this.renderer.setStyle(
        this.tooltipElement,
        'top',
        `${centerTop + scrollY}px`
      );
      this.renderer.setStyle(
        this.tooltipElement,
        'left',
        `${centerLeft + scrollX}px`
      );
      this.renderer.addClass(this.tooltipElement, 'c-tooltip--top');
    }
  }

  /**
   * Calcula las coordenadas del tooltip para una posición específica.
   */
  private calculatePosition(
    position: TooltipPosition,
    hostRect: DOMRect,
    tooltipRect: DOMRect
  ): { top: number; left: number } {
    switch (position) {
      case 'top':
        return {
          top: hostRect.top - tooltipRect.height - this.TOOLTIP_OFFSET,
          left: hostRect.left + (hostRect.width - tooltipRect.width) / 2,
        };

      case 'bottom':
        return {
          top: hostRect.bottom + this.TOOLTIP_OFFSET,
          left: hostRect.left + (hostRect.width - tooltipRect.width) / 2,
        };

      case 'left':
        return {
          top: hostRect.top + (hostRect.height - tooltipRect.height) / 2,
          left: hostRect.left - tooltipRect.width - this.TOOLTIP_OFFSET,
        };

      case 'right':
        return {
          top: hostRect.top + (hostRect.height - tooltipRect.height) / 2,
          left: hostRect.right + this.TOOLTIP_OFFSET,
        };
    }
  }

  /**
   * Verifica si el tooltip cabe completamente en el viewport con las coordenadas dadas.
   */
  private fitsInViewport(
    coords: { top: number; left: number },
    tooltipRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number
  ): boolean {
    const margin = 8; // Margen mínimo desde los bordes del viewport

    return (
      coords.top >= margin &&
      coords.left >= margin &&
      coords.top + tooltipRect.height <= viewportHeight - margin &&
      coords.left + tooltipRect.width <= viewportWidth - margin
    );
  }
}
