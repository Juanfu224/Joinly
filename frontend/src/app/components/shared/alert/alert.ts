import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './alert.html',
  styleUrls: ['./alert.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  type = input<AlertType>('info');
  message = input.required<string>();
  closeable = input<boolean>(false);
  closing = input<boolean>(false);
  closed = output<void>();

  alertClasses = computed(() => {
    const classes = ['c-alert', `c-alert--${this.type()}`];
    if (this.closing()) {
      classes.push('c-alert--closing');
    }
    return classes.join(' ');
  });

  onClose(): void {
    this.closed.emit();
  }
}
