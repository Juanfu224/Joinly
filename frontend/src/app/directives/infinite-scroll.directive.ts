import { Directive, ElementRef, effect, inject, input, OnDestroy, OnInit, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private observer?: IntersectionObserver;

  readonly threshold = input(0.1);
  readonly rootMargin = input('0px');
  readonly debounce = input(300);
  readonly disabled = input(false);

  readonly scrolled = output<void>();

  private debounceTimer?: ReturnType<typeof setTimeout>;
  private hasMore = true;

  constructor() {
    effect(() => {
      if (this.disabled() && this.observer) {
        this.observer.disconnect();
      } else if (!this.disabled() && !this.observer) {
        this.setupObserver();
      }
    });
  }

  ngOnInit(): void {
    if (!this.disabled()) {
      this.setupObserver();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && this.hasMore) {
          this.handleScroll();
        }
      },
      {
        threshold: this.threshold(),
        rootMargin: this.rootMargin()
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private handleScroll(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.scrolled.emit();
    }, this.debounce());
  }

  setHasMore(hasMore: boolean): void {
    this.hasMore = hasMore;
  }

  enable(): void {
    if (!this.observer) {
      this.setupObserver();
    }
  }

  disable(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
