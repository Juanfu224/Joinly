import { signal } from '@angular/core';

/** Tiempo mínimo entre submits (en milisegundos) */
export const SUBMIT_THROTTLE_MS = 1000;

/**
 * Crea un estado de formulario reutilizable.
 * @returns Objeto con signals para loading y error
 */
export function createFormState() {
  return {
    isLoading: signal(false),
    formError: signal<string | null>(null),
  };
}

/**
 * Verifica si ha pasado suficiente tiempo desde el último submit.
 * @param lastSubmitTime Timestamp del último submit
 * @param throttleMs Tiempo mínimo entre submits
 * @returns true si se puede hacer submit, false si debe esperar
 */
export function canSubmit(lastSubmitTime: number, throttleMs = SUBMIT_THROTTLE_MS): boolean {
  return Date.now() - lastSubmitTime >= throttleMs;
}

interface Focusable {
  focus(): void;
}

/**
 * Enfoca un componente de input.
 * Compatible con FormInputComponent que expone un método focus().
 * @param component Componente con método focus()
 */
export function focusInput(component: Focusable | undefined | null): void {
  component?.focus();
}

/**
 * Verifica si el evento de teclado debe disparar un submit.
 * @param event Evento de teclado
 * @returns true si es Enter y no está en un textarea
 */
export function shouldTriggerSubmit(event: KeyboardEvent): boolean {
  if (event.key !== 'Enter') return false;

  const target = event.target as HTMLElement;
  return target.tagName !== 'TEXTAREA';
}
