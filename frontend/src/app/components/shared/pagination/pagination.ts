import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type PaginationVariant = 'default' | 'compact';
type PaginationSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  /** Número actual de página (0-indexed) */
  currentPage = input.required<number>();

  /** Total de elementos */
  totalItems = input.required<number>();

  /** Tamaño de página */
  pageSize = input.required<number>();

  /** Variante visual del componente */
  variant = input<PaginationVariant>('default');

  /** Tamaño del componente */
  size = input<PaginationSize>('md');

  /** Número máximo de páginas a mostrar (default: 7) */
  maxPagesToShow = input<number>(7);

  /** Evento emitido al cambiar de página */
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => {
    return Math.ceil(this.totalItems() / this.pageSize());
  });

  protected readonly isFirstPage = computed(() => this.currentPage() === 0);

  protected readonly isLastPage = computed(() =>
    this.currentPage() >= this.totalPages() -1
  );

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const max = this.maxPagesToShow();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const half = Math.floor(max / 2);
    let start = Math.max(0, current - half);
    let end = Math.min(total, start + max);

    if (end - start < max) {
      start = Math.max(0, end - max);
    }

    const pages = Array.from({ length: end - start }, (_, i) => start + i);

    if (start > 0) {
      pages.unshift(-1);
    }

    if (end < total) {
      pages.push(-2);
    }

    return pages;
  });

  protected goToPage(page: number): void {
    if (page >=0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  protected prevPage(): void {
    if (!this.isFirstPage()) {
      this.pageChange.emit(this.currentPage() -1);
    }
  }

  protected nextPage(): void {
    if (!this.isLastPage()) {
      this.pageChange.emit(this.currentPage() +1);
    }
  }

  protected isFirst(): boolean {
    return this.currentPage() === 0;
  }

  protected isLast(): boolean {
    return this.currentPage() >= this.totalPages() -1;
  }

  protected isEllipsis(page: number): boolean {
    return page === -1 || page === -2;
  }
}
