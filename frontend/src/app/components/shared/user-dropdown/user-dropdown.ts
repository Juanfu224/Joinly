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
} from '@angular/core';
import { Router, RouterLink, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { IconComponent } from '../icon/icon';
import { AvatarComponent } from '../avatar/avatar';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.html',
  styleUrls: ['./user-dropdown.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown.escape)': 'close()',
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
    this.isOpen.update((open) => !open);
  }

  close(): void {
    this.isOpen.set(false);
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
}
