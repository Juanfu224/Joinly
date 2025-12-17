import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ThemeToggleComponent, IconComponent } from '../../components/shared';

/**
 * Componente de cabecera principal de la aplicación.
 * Contiene el logotipo, navegación móvil con menú hamburguesa, y área de utilidad con botones de acceso.
 *
 * @remarks
 * El logotipo soporta variantes de color mediante modificadores BEM:
 * - `.c-header__logo` (predeterminado): Texto oscuro + acento naranja oscuro (#ea580c)
 * - `.c-header__logo--claro-naranja`: Texto claro + acento naranja (#f97316)
 * - `.c-header__logo--morado`: Texto oscuro + acento morado oscuro (#7c3aed)
 * - `.c-header__logo--claro-morado`: Texto claro + acento morado (#9333ea)
 * - `.c-header__logo--azul`: Texto oscuro + acento azul (#60a5fa)
 * - `.c-header__logo--amarillo`: Texto oscuro + acento amarillo (#facc15)
 *
 * ### Menú hamburguesa móvil
 * - Se muestra solo en tablet hacia abajo (< 1024px)
 * - Incluye navegación: Inicio, Guía de Estilos, Login, Registro
 * - Se cierra al hacer click fuera, presionar ESC, o al navegar a otra ruta
 * - Bloquea el scroll del body cuando está abierto
 * - Overlay oscuro semi-transparente en el fondo
 *
 * @usageNotes
 * ```html
 * <app-header />
 * ```
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent, IconComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private navigationSubscription?: Subscription;

  /**
   * Signal que controla el estado de apertura del menú móvil.
   * true = menú abierto, false = menú cerrado
   */
  protected readonly menuOpen = signal(false);

  /**
   * Referencia al contenedor del menú móvil para gestión de clicks fuera.
   */
  protected readonly mobileMenu = viewChild<ElementRef>('mobileMenu');

  /**
   * Referencia al botón hamburguesa para gestión de clicks.
   */
  protected readonly menuButton = viewChild<ElementRef>('menuButton');

  ngOnInit(): void {
    // Cerrar menú al navegar a otra ruta
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.closeMenu();
      });
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
    // Asegurar que el body quede con scroll habilitado
    if (this.menuOpen()) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Alterna el estado del menú móvil entre abierto y cerrado.
   * Al abrir, bloquea el scroll del body. Al cerrar, lo restaura.
   */
  protected toggleMenu(): void {
    const newState = !this.menuOpen();
    this.menuOpen.set(newState);
    document.body.style.overflow = newState ? 'hidden' : '';
  }

  /**
   * Cierra el menú móvil explícitamente.
   * Restaura el scroll del body.
   */
  protected closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      document.body.style.overflow = '';
    }
  }

  /**
   * Cierra el menú al presionar la tecla ESC.
   * Solo actúa si el menú está abierto.
   */
  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    this.closeMenu();
  }

  /**
   * Cierra el menú al hacer click fuera de él.
   * Verifica que el click no sea en el botón hamburguesa ni dentro del menú.
   *
   * @param event - Evento de click del documento
   */
  @HostListener('document:click', ['$event'])
  protected handleClickOutside(event: MouseEvent): void {
    if (!this.menuOpen()) {
      return;
    }

    const clickedElement = event.target as HTMLElement;
    const menuElement = this.mobileMenu()?.nativeElement;
    const buttonElement = this.menuButton()?.nativeElement;

    // Verificar si el click fue fuera del menú y del botón
    const clickedOutside =
      menuElement &&
      !menuElement.contains(clickedElement) &&
      buttonElement &&
      !buttonElement.contains(clickedElement);

    if (clickedOutside) {
      this.closeMenu();
    }
  }

  /**
   * Cierra el menú al cambiar el tamaño de la ventana a desktop.
   * Previene que el menú quede abierto al rotar o cambiar de móvil a desktop.
   */
  @HostListener('window:resize')
  protected handleResize(): void {
    // Cerrar solo si estamos en tamaño desktop (>= 1024px)
    if (window.innerWidth >= 1024 && this.menuOpen()) {
      this.closeMenu();
    }
  }
}

