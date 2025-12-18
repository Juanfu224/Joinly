import { inject, Injectable, signal, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Tipo literal para representar los temas disponibles
 */
export type Theme = 'light' | 'dark';

/**
 * Servicio para gestionar el tema de la aplicación (claro/oscuro).
 * 
 * Proporciona funcionalidad para:
 * - Detectar la preferencia de tema del sistema operativo
 * - Cambiar entre tema claro y oscuro
 * - Persistir la preferencia del usuario en localStorage
 * - Reaccionar automáticamente a cambios en la preferencia del sistema
 * 
 * @usageNotes
 * ```typescript
 * // En app.ts (inicialización)
 * constructor() {
 *   this.themeService.initialize();
 * }
 * 
 * // En componente
 * toggleTheme() {
 *   this.themeService.toggleTheme();
 * }
 * 
 * // Leer tema actual
 * const currentTheme = this.themeService.currentTheme();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'joinly-theme' as const;
  private readonly THEME_ATTRIBUTE = 'data-theme' as const;

  /**
   * Signal que almacena el tema actual.
   * Permite reactividad automática en componentes que lo consumen.
   */
  readonly currentTheme = signal<Theme>('light');

  /**
   * MediaQueryList para detectar preferencia del sistema
   */
  private readonly prefersDarkScheme = this.document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)'
  );

  /**
   * Listener para cambios en preferencia del sistema (para limpieza)
   */
  private readonly systemChangeListener = (event: MediaQueryListEvent): void => {
    // Solo aplicar cambios automáticos si el usuario no ha guardado preferencia
    if (!this.getStoredTheme()) {
      const newTheme: Theme = event.matches ? 'dark' : 'light';
      this.applyTheme(newTheme);
    }
  };

  /**
   * Inicializa el servicio de temas.
   * 
   * 1. Lee preferencia guardada en localStorage
   * 2. Si no existe, detecta preferencia del sistema
   * 3. Aplica el tema detectado
   * 4. Suscribe a cambios en la preferencia del sistema
   * 
   * @remarks
   * Debe llamarse en el constructor del componente raíz (App)
   */
  initialize(): void {
    const savedTheme = this.getStoredTheme();
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme ?? systemTheme;

    this.applyTheme(initialTheme);
    this.listenToSystemChanges();
  }

  /**
   * Alterna entre tema claro y oscuro.
   * Persiste la nueva preferencia en localStorage.
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  /**
   * Establece un tema específico.
   * 
   * @param theme - El tema a aplicar ('light' o 'dark')
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Limpia listeners al destruir el servicio (previene memory leaks).
   */
  ngOnDestroy(): void {
    this.prefersDarkScheme?.removeEventListener('change', this.systemChangeListener);
  }

  /**
   * Aplica el tema modificando el atributo data-theme del elemento <html>.
   * Actualiza el signal para notificar a componentes suscritos.
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = this.document.documentElement;
    htmlElement.setAttribute(this.THEME_ATTRIBUTE, theme);
    this.currentTheme.set(theme);
  }

  /**
   * Obtiene la preferencia de tema guardada en localStorage.
   * 
   * @returns El tema guardado o null si no existe
   */
  private getStoredTheme(): Theme | null {
    if (typeof localStorage === 'undefined') return null;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  /**
   * Detecta la preferencia de tema del sistema operativo.
   * 
   * @returns 'dark' si el sistema prefiere modo oscuro, 'light' en caso contrario
   */
  private getSystemTheme(): Theme {
    return this.prefersDarkScheme?.matches ? 'dark' : 'light';
  }

  /**
   * Guarda la preferencia de tema en localStorage.
   */
  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  /**
   * Escucha cambios en la preferencia de tema del sistema.
   * Solo aplica cambios automáticos si NO hay preferencia guardada por el usuario.
   */
  private listenToSystemChanges(): void {
    this.prefersDarkScheme?.addEventListener('change', this.systemChangeListener);
  }
}
