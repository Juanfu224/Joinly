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
  closed = output<void>();

  alertClasses = computed(() => {
    return ['c-alert', `c-alert--${this.type()}`].join(' ');
  });

  onClose(): void {
    this.closed.emit();
  }
}
