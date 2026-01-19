import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastComponent } from '../toast/toast';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService).currentToasts;
}
