import { Component, inject } from '@angular/core';
import { AlertComponent } from '../alert/alert';
import { AlertService } from '../../../services/alert';

@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './alert-container.html',
  styleUrls: ['./alert-container.scss'],
})
export class AlertContainerComponent {
  protected readonly alertService = inject(AlertService);
  protected readonly alerts = this.alertService.currentAlerts;

  protected onClose(id: number): void {
    this.alertService.close(id);
  }
}
