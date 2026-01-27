import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio centralizado para gestionar estados de carga global.
 *
 * Implementa un sistema de tracking de operaciones pendientes con:
 * - Contador de requests para manejar concurrencia
 * - Debounce opcional para evitar parpadeos en requests rápidas
 * - Soporte híbrido: BehaviorSubject + Signal (Angular 21)
 *
 * @usageNotes
 * **Uso automático con HttpInterceptor:**
 * El interceptor llama show/hide automáticamente en cada request HTTP.
 *
 * **Uso manual en componentes:**
 * ```typescript
 * private readonly loadingService = inject(LoadingService);
 *
 * async save() {
 *   this.loadingService.show();
 *   try {
 *     await this.api.save(data);
 *   } finally {
 *     this.loadingService.hide();
 *   }
 * }
 * ```
 *
 * **En templates:**
 * ```html
 * @if (loadingService.isLoading()) {
 *   <app-spinner-overlay />
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  /**
   * Delay mínimo en ms antes de mostrar el spinner.
   * Evita parpadeos en requests muy rápidas (< 100ms).
   */
  private static readonly SHOW_DELAY_MS = 100;

  /**
   * Delay mínimo que el spinner permanece visible.
   * Evita parpadeos si el request termina justo después de mostrarse.
   */
  private static readonly MIN_VISIBLE_MS = 150;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private visibleSince: number | null = null;

  /**
   * Observable del estado de carga.
   * Útil para operadores RxJS avanzados o pipes async.
   */
  readonly isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Signal reactivo con el estado de carga actual.
   * Recomendado para templates y lógica de componentes Angular 21.
   */
  readonly isLoading = signal(false);

  /**
   * Signal computed que indica si NO hay carga activa.
   * Útil para habilitar botones/acciones.
   */
  readonly isIdle = computed(() => !this.isLoading());

  /**
   * Registra el inicio de una operación async.
   * Incrementa el contador y programa la visualización del spinner.
   *
   * @remarks
   * El spinner solo se muestra si la operación tarda más de SHOW_DELAY_MS.
   * Múltiples llamadas a show() incrementan el contador sin reiniciar el timer.
   */
  show(): void {
    this.requestCount++;

    // Solo programar visualización si es el primer request
    if (this.requestCount === 1 && !this.showTimeout) {
      this.showTimeout = setTimeout(() => {
        this.setLoading(true);
        this.visibleSince = Date.now();
        this.showTimeout = null;
      }, LoadingService.SHOW_DELAY_MS);
    }
  }

  /**
   * Registra el fin de una operación async.
   * Decrementa el contador y oculta el spinner cuando llega a 0.
   *
   * @remarks
   * El spinner permanece visible al menos MIN_VISIBLE_MS para evitar parpadeos.
   * Es seguro llamar hide() más veces que show() (el contador no baja de 0).
   */
  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);

    if (this.requestCount === 0) {
      // Cancelar timeout pendiente si el request terminó muy rápido
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
        return;
      }

      // Calcular tiempo restante de visibilidad mínima
      const visibleTime = this.visibleSince ? Date.now() - this.visibleSince : 0;
      const remainingTime = Math.max(0, LoadingService.MIN_VISIBLE_MS - visibleTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          // Verificar que no haya nuevos requests mientras esperábamos
          if (this.requestCount === 0) {
            this.setLoading(false);
            this.visibleSince = null;
          }
        }, remainingTime);
      } else {
        this.setLoading(false);
        this.visibleSince = null;
      }
    }
  }

  /**
   * Fuerza el reset del estado de carga.
   * Útil para limpieza en navegación o errores críticos.
   */
  reset(): void {
    this.requestCount = 0;
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    this.setLoading(false);
    this.visibleSince = null;
  }

  /**
   * Actualiza ambos: BehaviorSubject y Signal.
   */
  private setLoading(value: boolean): void {
    this.loadingSubject.next(value);
    this.isLoading.set(value);
  }
}
