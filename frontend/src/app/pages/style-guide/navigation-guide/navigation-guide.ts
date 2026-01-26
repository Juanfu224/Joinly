import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CardComponent,
  ButtonComponent,
  IconComponent,
  AccordionComponent,
  AccordionItemComponent,
} from '../../../components/shared';

/**
 * Datos de ejemplo para demostrar state navigation.
 */
interface DemoProduct {
  id: number;
  name: string;
  price: number;
}

/**
 * Guía de Navegación Programática - Ejemplos interactivos.
 *
 * Demuestra técnicas avanzadas de navegación en Angular 21:
 * Fragments, Query Params, State, replaceUrl, skipLocationChange.
 *
 * @usageNotes
 * Ruta: /style-guide/navigation-guide
 */
@Component({
  selector: 'app-navigation-guide',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    ButtonComponent,
    IconComponent,
    AccordionComponent,
    AccordionItemComponent,
  ],
  templateUrl: './navigation-guide.html',
  styleUrl: './navigation-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationGuideComponent {
  private readonly router = inject(Router);

  protected readonly navigationLog = signal<string[]>([]);
  protected readonly receivedState = signal<string | null>(null);

  protected readonly demoProduct: DemoProduct = {
    id: 123,
    name: 'Producto Demo',
    price: 29.99,
  };

  // =========================================================================
  // DEMOS
  // =========================================================================

  protected navigateWithFragment(fragment: string): void {
    this.addLog(`router.navigate(['/faq'], { fragment: '${fragment}' })`);
    this.router.navigate(['/faq'], { fragment });
  }

  protected navigateWithQueryParams(): void {
    this.addLog(
      `router.navigate(['/dashboard'], { queryParams: { sort: 'nombre', order: 'asc' } })`,
    );
    this.addLog(`➡️ URL: /dashboard?sort=nombre&order=asc`);
  }

  protected navigateWithMerge(): void {
    this.addLog(`router.navigate([], { queryParams: { page: 2 }, queryParamsHandling: 'merge' })`);
    this.addLog(`➡️ Preserva params existentes y añade page=2`);
  }

  protected navigateWithState(): void {
    const state = { product: this.demoProduct };
    this.addLog(`router.navigate(['/grupos/1'], { state: ${JSON.stringify(state)} })`);
    this.addLog(`📦 Datos NO visibles en URL`);
  }

  protected simulateReceiveState(): void {
    this.receivedState.set(JSON.stringify({ product: this.demoProduct }, null, 2));
    this.addLog(`📥 State recibido en destino`);
  }

  protected navigateWithReplace(): void {
    this.addLog(`router.navigate(['/dashboard'], { replaceUrl: true })`);
    this.addLog(`🔄 Historial reemplazado (no añadido)`);
  }

  protected navigateWithSkipLocation(): void {
    this.addLog(`router.navigate(['/hidden'], { skipLocationChange: true })`);
    this.addLog(`👻 Contenido cargado pero URL no cambia`);
  }

  protected goToFaqDemo(): void {
    this.router.navigate(['/faq'], { fragment: 'suscripciones' });
  }

  protected goToDashboardDemo(): void {
    this.router.navigate(['/dashboard']);
  }

  protected clearLog(): void {
    this.navigationLog.set([]);
    this.receivedState.set(null);
  }

  private addLog(message: string): void {
    this.navigationLog.update((log) => [...log, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }
}
