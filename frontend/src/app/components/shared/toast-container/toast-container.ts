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
  private readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.currentToasts;

  onClose(id: number): void {
    this.toastService.close(id);
  }

  onPause(id: number): void {
    this.toastService.pause(id);
  }

  onResume(id: number): void {
    this.toastService.resume(id);
  }
}
