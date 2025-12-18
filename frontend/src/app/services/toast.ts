import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  readonly id: number;
  readonly type: ToastType;
  readonly message: string;
  readonly duration: number;
  readonly closing?: boolean;
  readonly paused?: boolean;
}

/**
 * Servicio centralizado para gestionar notificaciones toast.
 * Soporta múltiples toasts, auto-cierre configurable y pausa en hover.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private static readonly DEFAULT_DURATION = 5000;
  private static readonly ANIMATION_DURATION = 300;
  private static readonly MAX_VISIBLE_TOASTS = 5;

  private toastId = 0;
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly toasts = signal<ToastMessage[]>([]);

  readonly currentToasts = this.toasts.asReadonly();

  show(type: ToastType, message: string, duration = ToastService.DEFAULT_DURATION): void {
    const toast: ToastMessage = {
      id: ++this.toastId,
      type,
      message,
      duration,
    };

    // Añadir toast y limitar cantidad visible
    this.toasts.update((toasts) => {
      const updated = [...toasts, toast];
      // Si excede el límite, cerrar los más antiguos
      if (updated.length > ToastService.MAX_VISIBLE_TOASTS) {
        const excess = updated.length - ToastService.MAX_VISIBLE_TOASTS;
        for (let i = 0; i < excess; i++) {
          this.close(updated[i].id);
        }
      }
      return updated;
    });

    // Programar auto-cierre si tiene duración
    if (duration > 0) {
      this.scheduleClose(toast.id, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  pause(id: number): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
      this.toasts.update((toasts) =>
        toasts.map((t) => (t.id === id ? { ...t, paused: true } : t))
      );
    }
  }

  resume(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (toast?.paused && toast.duration > 0) {
      this.toasts.update((toasts) =>
        toasts.map((t) => (t.id === id ? { ...t, paused: false } : t))
      );
      this.scheduleClose(id, toast.duration);
    }
  }

  close(id: number): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    this.toasts.update((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );

    setTimeout(() => this.remove(id), ToastService.ANIMATION_DURATION);
  }

  closeAll(): void {
    this.toasts().forEach((toast) => this.close(toast.id));
  }

  private scheduleClose(id: number, duration: number): void {
    const timeout = setTimeout(() => this.close(id), duration);
    this.timeouts.set(id, timeout);
  }

  private remove(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
