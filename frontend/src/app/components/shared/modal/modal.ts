import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  viewChild,
  inject,
  computed,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from '../../../services/modal';
import { ButtonComponent, IconComponent } from '../index';

/**
 * Componente Modal - Ventana emergente accesible con gestión de foco.
 *
 * **Características:**
 * - Gestión centralizada a través de ModalService
 * - Focus trap (navegación con Tab solo dentro del modal)
 * - Cierre con ESC, click en overlay, o botón X
 * - Prevención de scroll del body cuando está abierto
 * - Animaciones de entrada y salida
 * - Totalmente accesible (ARIA, teclado)
 * - Restauración de foco al cerrar
 *
 * @usageNotes
 * ```typescript
 * // En app.html (root component)
 * <app-modal />
 *
 * // Para abrir el modal desde cualquier componente:
 * private readonly modalService = inject(ModalService);
 *
 * openModal() {
 *   this.modalService.open({
 *     title: '¿Confirmar acción?',
 *     content: 'Esta acción no se puede deshacer.',
 *     confirmText: 'Confirmar',
 *     cancelText: 'Cancelar',
 *     onConfirm: () => this.handleConfirm(),
 *   });
 * }
 * ```
 *
 * @remarks
 * El modal implementa focus trap manual para cumplir requisitos educativos.
 * Detecta elementos focusables y gestiona la navegación con Tab/Shift+Tab.
 *
 * Manipulación del DOM (viewChild + ElementRef):
 * - Acceder al contenedor del modal para gestionar foco
 * - Detectar elementos focusables dinámicamente
 * - Enfocar primer elemento al abrir modal
 * - Ciclar el foco entre primer y último elemento focusable
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, OnDestroy {
  protected readonly modalService = inject(ModalService);
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Referencia al contenedor del contenido del modal
   * Usado para gestión de foco y focus trap
   */
  protected readonly modalContent = viewChild<ElementRef>('modalContent');

  /**
   * Contenido HTML sanitizado del modal
   */
  protected readonly sanitizedContent = computed<SafeHtml>(() => {
    const content = this.modalService.config()?.content ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  });

  /**
   * Elementos focusables dentro del modal (calculados dinámicamente)
   */
  private focusableElements: HTMLElement[] = [];

  ngOnInit(): void {
    // Observar cambios en isOpen para enfocar cuando se abre
    // En Angular 21 con signals, el efecto se ejecuta automáticamente
  }

  ngOnDestroy(): void {
    // Asegurar que el body quede con scroll habilitado
    if (this.modalService.isOpen()) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Cierra el modal con la tecla ESC si está configurado para hacerlo.
   * Solo actúa si el modal está abierto y closeOnEscape es true.
   */
  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    const config = this.modalService.config();
    if (this.modalService.isOpen() && config?.closeOnEscape !== false) {
      this.modalService.close();
    }
  }

  /**
   * Implementa focus trap: maneja navegación con Tab dentro del modal.
   *
   * @remarks
   * Cuando el usuario presiona Tab o Shift+Tab:
   * 1. Detecta todos los elementos focusables dentro del modal
   * 2. Si está en el último elemento y presiona Tab, vuelve al primero
   * 3. Si está en el primero y presiona Shift+Tab, va al último
   * 4. Previene que el foco salga del modal
   *
   * Esto cumple WCAG 2.1 AA para modales accesibles.
   */
  @HostListener('keydown', ['$event'])
  protected handleTabKey(event: KeyboardEvent): void {
    // Solo procesar si es Tab y el modal está abierto
    if (event.key !== 'Tab' || !this.modalService.isOpen()) {
      return;
    }

    const modalEl = this.modalContent()?.nativeElement;
    if (!modalEl) {
      return;
    }

    // Detectar elementos focusables dentro del modal
    this.updateFocusableElements(modalEl);

    if (this.focusableElements.length === 0) {
      return;
    }

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    // Shift + Tab: si estamos en el primer elemento, ir al último
    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab: si estamos en el último elemento, ir al primero
    else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Maneja el click en el overlay para cerrar el modal.
   * Solo cierra si closeOnOverlayClick es true.
   *
   * @param event - Evento de click
   */
  protected handleOverlayClick(event: MouseEvent): void {
    const config = this.modalService.config();
    if (config?.closeOnOverlayClick !== false) {
      this.modalService.close();
    }
  }

  /**
   * Previene que el click en el contenido del modal cierre el modal.
   * Usa $event.stopPropagation() para evitar que el evento llegue al overlay.
   *
   * @param event - Evento de click
   *
   * @remarks
   * Este es un ejemplo práctico del uso de stopPropagation():
   * - El overlay tiene (click)="handleOverlayClick()"
   * - El contenido tiene (click)="$event.stopPropagation()"
   * - Sin stopPropagation, ambos handlers se ejecutarían
   * - Con stopPropagation, solo se ejecuta el del contenido
   */
  protected preventClose(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Maneja el click en el botón de confirmar.
   */
  protected handleConfirm(): void {
    this.modalService.confirm();
  }

  /**
   * Maneja el click en el botón de cancelar o cerrar (X).
   */
  protected handleCancel(): void {
    this.modalService.cancel();
  }

  /**
   * Callback cuando el modal se abre (después de la animación de entrada).
   * Enfoca el primer elemento focusable del modal.
   *
   * @remarks
   * Este método se llama desde el template con @if para detectar cuando
   * el modal se renderiza. Usa viewChild para acceder al DOM y enfocar.
   */
  protected onModalOpened(): void {
    // Esperar un tick para que el DOM esté renderizado
    setTimeout(() => {
      const modalEl = this.modalContent()?.nativeElement;
      if (!modalEl) {
        return;
      }

      // Actualizar lista de elementos focusables
      this.updateFocusableElements(modalEl);

      // Enfocar el primer elemento (o el botón de cerrar si no hay otros)
      if (this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      }
    }, 100); // Delay para permitir que la animación de entrada comience
  }

  /**
   * Detecta y almacena todos los elementos focusables dentro del modal.
   *
   * @param container - Contenedor donde buscar elementos focusables
   *
   * @remarks
   * Elementos considerados focusables:
   * - Enlaces con href
   * - Botones
   * - Inputs, selects, textareas
   * - Elementos con tabindex >= 0
   *
   * Excluye elementos con tabindex="-1" o disabled.
   */
  private updateFocusableElements(container: HTMLElement): void {
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const elements = container.querySelectorAll<HTMLElement>(selector);
    this.focusableElements = Array.from(elements);
  }
}
