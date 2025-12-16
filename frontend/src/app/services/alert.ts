import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessage {
  readonly id: number;
  readonly type: AlertType;
  readonly message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertId = 0;
  private readonly alerts = signal<AlertMessage[]>([]);
  readonly currentAlerts = this.alerts.asReadonly();

  show(type: AlertType, message: string, duration = 5000): void {
    const alert: AlertMessage = {
      id: ++this.alertId,
      type,
      message,
    };

    this.alerts.update((alerts) => [...alerts, alert]);

    if (duration > 0) {
      setTimeout(() => this.close(alert.id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration ?? 5000);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration ?? 5000);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration ?? 5000);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration ?? 5000);
  }

  close(id: number): void {
    this.alerts.update((alerts) => alerts.filter((a) => a.id !== id));
  }
}
