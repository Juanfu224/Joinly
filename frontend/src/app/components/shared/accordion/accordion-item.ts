import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import type { AccordionComponent } from './accordion';
import { generateShortId } from '../../../utils/uuid';

/**
 * Componente AccordionItem - Item individual expandible/colapsable.
 *
 * **Características:**
 * - Signal para estado expandido/colapsado con reactividad
 * - ViewChild + ElementRef para manipulación DOM del contenido
 * - Renderer2 para aplicar altura dinámica durante animaciones
 * - Cálculo automático de altura con scrollHeight
 * - Navegación con teclado (Enter, Space)
 * - Atributos ARIA completos para accesibilidad
 * - IDs únicos generados automáticamente
 *
 * @usageNotes
 * ```html
 * <!-- Item básico -->
 * <app-accordion-item title="Título del item">
 *   Contenido del item que se expandirá/colapsará
 * </app-accordion-item>
 *
 * <!-- Item expandido por defecto -->
 * <app-accordion-item title="Pregunta frecuente" [expanded]="true">
 *   Respuesta a la pregunta
 * </app-accordion-item>
 *
 * <!-- Item deshabilitado -->
 * <app-accordion-item title="Opción no disponible" [disabled]="true">
 *   Este contenido no está disponible aún
 * </app-accordion-item>
 * ```
 *
 * @remarks
 * Manipulación del DOM:
 * - ViewChild: Accede al elemento del contenido para leer su altura
 * - ElementRef: Obtiene la referencia nativa del DOM
 * - Renderer2: Modifica la altura de forma segura (sin acceso directo)
 * - scrollHeight: Calcula la altura real del contenido (aunque esté oculto)
 * 
 * La animación funciona estableciendo height: 0 cuando está colapsado y
 * height: [scrollHeight]px cuando está expandido. CSS transitions hace
 * el resto del trabajo.
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './accordion-item.html',
  styleUrls: ['./accordion-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent implements AfterViewInit {
  private readonly renderer = inject(Renderer2);

  /**
   * Título del accordion item (mostrado en el header)
   */
  title = input.required<string>();

  /**
   * Estado inicial expandido
   * @default false
   */
  expanded = input<boolean>(false);

  /**
   * Deshabilita la interacción con este item
   * @default false
   */
  disabled = input<boolean>(false);

  /**
   * Signal que controla si el item está expandido o colapsado
   */
  protected readonly isExpandedSignal = signal<boolean>(false);

  /**
   * Referencia al contenedor del contenido expandible
   * Usado para calcular altura dinámica y aplicar animaciones
   */
  protected readonly contentWrapper = viewChild<ElementRef>('contentWrapper');

  /**
   * IDs únicos para vinculación ARIA
   */
  protected readonly headerId = generateShortId('accordion-header');
  protected readonly contentId = generateShortId('accordion-content');

  /**
   * Referencia al componente padre (Accordion)
   */
  private parentAccordion?: AccordionComponent;

  ngAfterViewInit(): void {
    // Aplicar estado inicial después de que el view esté listo
    if (this.expanded()) {
      // Usar queueMicrotask para evitar ExpressionChangedAfterItHasBeenCheckedError
      // queueMicrotask es más performante que setTimeout(fn, 0)
      queueMicrotask(() => {
        this.expand();
      });
    }
  }

  /**
   * Registra el accordion padre para coordinar el estado de múltiples items
   */
  registerParent(parent: AccordionComponent): void {
    this.parentAccordion = parent;
  }

  /**
   * Devuelve si el item está actualmente expandido
   */
  isExpanded(): boolean {
    return this.isExpandedSignal();
  }

  /**
   * Alterna entre expandido y colapsado
   */
  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    if (this.isExpandedSignal()) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /**
   * Expande el item mostrando su contenido con animación.
   * 
   * @remarks
   * Proceso de expansión:
   * 1. Actualiza el signal para cambiar aria-expanded
   * 2. Obtiene el wrapper del contenido mediante ViewChild
   * 3. Calcula la altura real con scrollHeight
   * 4. Aplica la altura usando Renderer2 (seguro)
   * 5. CSS transitions anima el cambio suavemente
   * 6. Notifica al padre si existe
   */
  expand(): void {
    this.isExpandedSignal.set(true);

    // Obtener referencia al elemento del contenido
    const wrapper = this.contentWrapper();
    if (!wrapper) {
      return;
    }

    const element = wrapper.nativeElement as HTMLElement;

    // Calcular altura real del contenido (aunque esté oculto)
    const height = element.scrollHeight;

    // Aplicar altura usando Renderer2 para animación
    this.renderer.setStyle(element, 'height', `${height}px`);

    // Notificar al padre
    if (this.parentAccordion) {
      this.parentAccordion.onItemExpanded(this);
    }
  }

  /**
   * Colapsa el item ocultando su contenido con animación.
   * 
   * @remarks
   * El proceso es inverso a expand():
   * 1. Actualiza el signal para cambiar aria-expanded
   * 2. Establece height: 0 usando Renderer2
   * 3. CSS transitions anima el colapso
   */
  collapse(): void {
    this.isExpandedSignal.set(false);

    const wrapper = this.contentWrapper();
    if (!wrapper) {
      return;
    }

    const element = wrapper.nativeElement as HTMLElement;

    // Establecer altura 0 para colapsar
    this.renderer.setStyle(element, 'height', '0');
  }

  /**
   * Maneja eventos de teclado para accesibilidad.
   * Enter o Space activan el toggle.
   * 
   * @remarks
   * @HostListener escucha eventos en el elemento host del componente.
   * preventDefault() evita el scroll al presionar Space.
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    // Enter o Space activan el toggle
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }
}
