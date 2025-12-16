import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
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
