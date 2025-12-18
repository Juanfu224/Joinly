import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessage {
  readonly id: number;
  readonly type: AlertType;
  readonly message: string;
  readonly closing?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private static readonly DEFAULT_DURATION = 2000;
  private static readonly ANIMATION_DURATION = 300;

  private alertId = 0;
  private readonly alerts = signal<AlertMessage[]>([]);
  readonly currentAlerts = this.alerts.asReadonly();

  show(type: AlertType, message: string, duration = AlertService.DEFAULT_DURATION): void {
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
    this.show('success', message, duration ?? AlertService.DEFAULT_DURATION);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration ?? AlertService.DEFAULT_DURATION);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration ?? AlertService.DEFAULT_DURATION);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration ?? AlertService.DEFAULT_DURATION);
  }

  close(id: number): void {
    // Marcar como cerrándose para activar la animación de salida
    this.alerts.update((alerts) =>
      alerts.map((a) => (a.id === id ? { ...a, closing: true } : a))
    );

    // Eliminar después de la animación
    setTimeout(() => this.remove(id), AlertService.ANIMATION_DURATION);
  }

  private remove(id: number): void {
    this.alerts.update((alerts) => alerts.filter((a) => a.id !== id));
  }
}
