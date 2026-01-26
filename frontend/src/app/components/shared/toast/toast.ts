import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { type IconName } from '../icon/icon-paths';
import type { ToastType } from '../../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  type = input<ToastType>('info');
  message = input.required<string>();
  closing = input(false);

  private readonly iconMap: Record<ToastType, IconName> = {
    success: 'circle-check',
    error: 'circle-x',
    warning: 'alert-triangle',
    info: 'info',
  };

  protected toastClasses = computed(() => {
    const classes = ['c-toast', `c-toast--${this.type()}`];
    if (this.closing()) classes.push('c-toast--closing');
    return classes.join(' ');
  });

  protected icon = computed<IconName>(() => this.iconMap[this.type()]);
}
