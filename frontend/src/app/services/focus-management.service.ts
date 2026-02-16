import { Injectable, inject, effect, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

const MAIN_CONTENT_ID = 'contenido-principal';

@Injectable({
  providedIn: 'root',
})
export class FocusManagementService {
  private readonly router = inject(Router);

  readonly shouldAnnounceNavigation = signal(false);
  readonly navigationAnnouncement = signal('');

  constructor() {
    this.setupNavigationListener();
  }

  private setupNavigationListener(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;
        this.handleNavigation(navigationEnd);
      });
  }

  private handleNavigation(navigationEnd: NavigationEnd): void {
    const pageTitle = this.extractPageTitle();
    if (pageTitle) {
      this.announceNavigation(pageTitle);
    }
    this.focusMainContent();
  }

  private extractPageTitle(): string | null {
    const route = this.router.routerState.root;
    let currentRoute = route;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const title = currentRoute.snapshot.title;
    if (title) {
      return title.replace(' - Joinly', '').trim();
    }

    return null;
  }

  focusMainContent(): void {
    setTimeout(() => {
      const mainContent = document.getElementById(MAIN_CONTENT_ID);
      if (mainContent) {
        mainContent.focus();
      }
    }, 100);
  }

  announceNavigation(pageTitle: string): void {
    this.navigationAnnouncement.set(`Navegando a ${pageTitle}`);
    this.shouldAnnounceNavigation.set(true);

    setTimeout(() => {
      this.shouldAnnounceNavigation.set(false);
    }, 1000);
  }

  focusElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
    }, 50);
  }

  focusFirstHeading(): void {
    setTimeout(() => {
      const mainContent = document.getElementById(MAIN_CONTENT_ID);
      if (mainContent) {
        const heading = mainContent.querySelector('h1, h2');
        if (heading) {
          (heading as HTMLElement).focus();
        }
      }
    }, 100);
  }
}
