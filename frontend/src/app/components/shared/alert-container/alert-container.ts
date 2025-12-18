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
  protected readonly alerts = inject(AlertService).currentAlerts;
}
