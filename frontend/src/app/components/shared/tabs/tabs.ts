import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { TabComponent } from './tab';

/**
 * Componente Tabs - Sistema de pestañas para organizar contenido relacionado.
 *
 * **Características:**
 * - Gestión automática de tabs mediante ContentChildren
 * - Navegación con teclado (Arrow Left/Right, Home/End, Enter/Space)
 * - Indicador visual deslizante para el tab activo
 * - Transiciones suaves entre pestañas (fade in/out)
 * - Totalmente accesible con ARIA y roving tabindex
 * - OnPush change detection para rendimiento óptimo
 *
 * @usageNotes
 * ```html
 * <!-- Tabs básico con primera pestaña activa -->
 * <app-tabs>
 *   <app-tab title="General">
 *     Contenido general
 *   </app-tab>
 *   <app-tab title="Avanzado">
 *     Contenido avanzado
 *   </app-tab>
 * </app-tabs>
 *
 * <!-- Tabs con pestaña inicial específica -->
 * <app-tabs [activeIndex]="1">
 *   <app-tab title="Perfil">
 *     Información del perfil
 *   </app-tab>
 *   <app-tab title="Seguridad">
 *     Configuración de seguridad
 *   </app-tab>
 *   <app-tab title="Notificaciones">
 *     Preferencias de notificaciones
 *   </app-tab>
 * </app-tabs>
 *
 * <!-- Tabs con callback al cambiar -->
 * <app-tabs (tabChange)="onTabChange($event)">
 *   <app-tab title="Vista">Contenido</app-tab>
 *   <app-tab title="Editar">Formulario</app-tab>
 * </app-tabs>
 * ```
 *
 * @remarks
 * El componente padre detecta automáticamente los tabs hijos mediante
 * ContentChildren. Implementa roving tabindex para navegación con teclado:
 * solo el tab activo tiene tabindex="0", los demás tienen tabindex="-1".
 *
 * Eventos de teclado:
 * - Arrow Left/Right: Navega entre pestañas
 * - Home/End: Va a primera/última pestaña
 * - Enter/Space: Activa la pestaña enfocada
 *
 * El indicador visual se actualiza con Renderer2 para posicionarlo
 * dinámicamente bajo el tab activo con transición suave.
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterContentInit {
  private readonly renderer = inject(Renderer2);

  /**
   * Índice del tab activo inicialmente
   * @default 0
   */
  activeIndex = input<number>(0);

  /**
   * Evento emitido cuando cambia el tab activo
   */
  tabChange = output<{ index: number; previousIndex: number }>();

  /**
   * Signal que controla el índice del tab activo actual
   */
  protected readonly activeIndexSignal = signal<number>(0);

  /**
   * Referencia a todos los tabs detectados automáticamente
   */
  protected readonly tabs = contentChildren(TabComponent);

  /**
   * Referencia a la lista de botones de tabs (tablist)
   */
  protected readonly tabList = viewChild<ElementRef>('tablist');

  /**
   * Referencia al indicador visual del tab activo
   */
  protected readonly indicator = viewChild<ElementRef>('indicator');

  /**
   * Effect para sincronizar el input activeIndex con el signal interno
   */
  constructor() {
    effect(() => {
      const index = this.activeIndex();
      if (index !== this.activeIndexSignal()) {
        this.selectTab(index, false);
      }
    });

    // Effect para actualizar posición del indicador cuando cambia el tab activo
    effect(() => {
      const activeIndex = this.activeIndexSignal();
      const tabsArray = this.tabs();

      if (tabsArray.length > 0) {
        // Usar queueMicrotask para asegurar que el DOM está actualizado
        queueMicrotask(() => {
          this.updateIndicatorPosition();
        });
      }
    });
  }

  ngAfterContentInit(): void {
    // Activar el tab inicial
    const initialIndex = this.activeIndex();
    if (initialIndex >= 0 && initialIndex < this.tabs().length) {
      this.selectTab(initialIndex, false);
    } else {
      this.selectTab(0, false);
    }

    // Actualizar posición del indicador después de renderizar
    queueMicrotask(() => {
      this.updateIndicatorPosition();
    });
  }

  /**
   * Selecciona un tab por su índice.
   *
   * @param index - Índice del tab a activar
   * @param emitEvent - Si debe emitir el evento tabChange
   */
  protected selectTab(index: number, emitEvent = true): void {
    const tabsArray = this.tabs();

    if (index < 0 || index >= tabsArray.length) {
      return;
    }

    const previousIndex = this.activeIndexSignal();

    if (previousIndex === index) {
      return;
    }

    // Desactivar tab anterior
    if (previousIndex >= 0 && previousIndex < tabsArray.length) {
      tabsArray[previousIndex].deactivate();
    }

    // Activar nuevo tab
    tabsArray[index].activate();
    this.activeIndexSignal.set(index);

    // Emitir evento si es necesario
    if (emitEvent) {
      this.tabChange.emit({ index, previousIndex });
    }

    // Actualizar posición del indicador
    queueMicrotask(() => {
      this.updateIndicatorPosition();
    });
  }

  /**
   * Maneja los clicks en los botones de tabs.
   *
   * @param index - Índice del tab clickeado
   * @param event - Evento del mouse
   */
  protected onTabClick(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.selectTab(index);

    // Enfocar el botón clickeado
    const button = (event.target as HTMLElement).closest('button');
    if (button) {
      button.focus();
    }
  }

  /**
   * Maneja la navegación con teclado en los tabs.
   *
   * @remarks
   * Implementa el patrón roving tabindex:
   * - Arrow Left/Right: Navega entre tabs
   * - Home/End: Va a primera/última pestaña
   * - Enter/Space: Activa el tab enfocado
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    // Solo procesar si el evento viene de un botón de tab
    if (!target.matches('[role="tab"]')) {
      return;
    }

    const tabsArray = this.tabs();
    const currentIndex = this.activeIndexSignal();
    let newIndex = currentIndex;
    let shouldPreventDefault = false;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabsArray.length - 1;
        shouldPreventDefault = true;
        break;

      case 'ArrowRight':
        newIndex = currentIndex < tabsArray.length - 1 ? currentIndex + 1 : 0;
        shouldPreventDefault = true;
        break;

      case 'Home':
        newIndex = 0;
        shouldPreventDefault = true;
        break;

      case 'End':
        newIndex = tabsArray.length - 1;
        shouldPreventDefault = true;
        break;

      case 'Enter':
      case ' ':
        this.selectTab(currentIndex);
        shouldPreventDefault = true;
        break;
    }

    if (shouldPreventDefault) {
      event.preventDefault();

      // Si cambió el índice, seleccionar y enfocar nuevo tab
      if (newIndex !== currentIndex) {
        this.selectTab(newIndex);

        // Enfocar el nuevo tab
        queueMicrotask(() => {
          const tabButtons = this.getTabButtons();
          if (tabButtons[newIndex]) {
            tabButtons[newIndex].focus();
          }
        });
      }
    }
  }

  /**
   * Actualiza la posición y ancho del indicador visual del tab activo.
   *
   * @remarks
   * Usa Renderer2 para modificar los estilos de forma segura.
   * Calcula la posición y ancho del tab activo con getBoundingClientRect().
   */
  private updateIndicatorPosition(): void {
    const indicatorElement = this.indicator();
    const tabButtons = this.getTabButtons();
    const activeIndex = this.activeIndexSignal();

    if (!indicatorElement || activeIndex < 0 || activeIndex >= tabButtons.length) {
      return;
    }

    const activeButton = tabButtons[activeIndex];
    const tabListElement = this.tabList()?.nativeElement;

    if (!activeButton || !tabListElement) {
      return;
    }

    const buttonRect = activeButton.getBoundingClientRect();
    const listRect = tabListElement.getBoundingClientRect();

    // Calcular posición relativa al tablist
    const left = buttonRect.left - listRect.left;
    const width = buttonRect.width;

    // Aplicar estilos con Renderer2
    const indicator = indicatorElement.nativeElement as HTMLElement;
    this.renderer.setStyle(indicator, 'transform', `translateX(${left}px)`);
    this.renderer.setStyle(indicator, 'width', `${width}px`);
  }

  /**
   * Obtiene todos los botones de tab del DOM.
   */
  private getTabButtons(): HTMLElement[] {
    const tabListElement = this.tabList()?.nativeElement;
    if (!tabListElement) {
      return [];
    }
    return Array.from(tabListElement.querySelectorAll('[role="tab"]'));
  }
}
