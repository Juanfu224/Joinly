import {
  Component,
  ChangeDetectionStrategy,
  signal,
  output,
  input,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  viewChildren,
} from '@angular/core';
import { Router, RouterLink, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { IconComponent } from '../icon/icon';
import { AvatarComponent } from '../avatar/avatar';

/**
 * Componente UserDropdown - Menú desplegable de usuario con accesibilidad completa.
 *
 * **Características de accesibilidad:**
 * - Navegación con teclado (Arrow Down/Up, Escape, Tab)
 * - Focus trap cuando el menú está abierto
 * - Cierre al hacer click fuera
 * - Cierre al navegar a otra ruta
 * - ARIA attributes para lectores de pantalla
 * - Roving tabindex para navegación por items
 */
@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.html',
  styleUrls: ['./user-dropdown.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'handleClickOutside($event)',
  },
  imports: [RouterLink, IconComponent, AvatarComponent],
})
export class UserDropdownComponent implements OnInit, OnDestroy {
  readonly userName = input.required<string>();
  readonly userEmail = input<string>();
  readonly userAvatar = input<string>();
  readonly logout = output<void>();

  readonly isOpen = signal(false);
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  private navigationSubscription?: Subscription;

  /**
   * Referencias a los elementos del menú para navegación con teclado
   */
  protected readonly menuItems = viewChildren<ElementRef<HTMLElement>>('menuItem');

  /**
   * Índice del item actualmente enfocado (-1 = ninguno)
   */
  protected focusedIndex = signal(-1);

  ngOnInit(): void {
    // Cerrar dropdown al navegar a otra ruta
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.close();
      });
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Abre el dropdown y enfoca el primer item
   */
  protected open(): void {
    this.isOpen.set(true);
    // Enfocar el primer item después de que el DOM se actualice
    setTimeout(() => {
      this.focusItem(0);
    }, 0);
  }

  close(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
  }

  handleClickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isOpen()) {
      this.close();
    }
  }

  onLogout(): void {
    this.close();
    this.logout.emit();
  }

  /**
   * Maneja la navegación con teclado cuando el dropdown está abierto
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      return;
    }

    const items = this.menuItems();
    const itemCount = items.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(itemCount);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(itemCount);
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        // Devolver el foco al trigger
        this.elementRef.nativeElement.querySelector('button')?.focus();
        break;

      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;

      case 'End':
        event.preventDefault();
        this.focusItem(itemCount - 1);
        break;

      case 'Tab':
        // Cerrar el dropdown al salir con Tab
        this.close();
        break;
    }
  }

  /**
   * Enfoca el siguiente item en la lista (circular)
   */
  private focusNextItem(itemCount: number): void {
    const currentIndex = this.focusedIndex();
    const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
    this.focusItem(nextIndex);
  }

  /**
   * Enfoca el item anterior en la lista (circular)
   */
  private focusPreviousItem(itemCount: number): void {
    const currentIndex = this.focusedIndex();
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
    this.focusItem(previousIndex);
  }

  /**
   * Enfoca un item específico por su índice
   */
  private focusItem(index: number): void {
    const items = this.menuItems();
    if (index >= 0 && index < items.length) {
      items[index].nativeElement.focus();
      this.focusedIndex.set(index);
    }
  }
}
