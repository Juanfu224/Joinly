import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import type { CanComponentDeactivate } from '../../../guards';

import { ButtonComponent } from '../button/button';
import { FormCardComponent } from '../form-card/form-card';
import { FormInputComponent } from '../form-input/form-input';
import { canSubmit, focusInput, shouldTriggerSubmit } from '../form-utils';
import { getFieldErrorMessage, type FieldErrorMessages } from '../form-validators';

interface CreateGroupFormValue {
  nombre: string;
}

/** Formulario para crear un nuevo grupo/unidad familiar. */
@Component({
  selector: 'app-create-group-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormCardComponent, ButtonComponent],
  templateUrl: './create-group-form.html',
  styleUrl: './create-group-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'c-create-group-form',
    '(keydown)': 'handleEnterKey($event)',
  },
})
export class CreateGroupFormComponent implements CanComponentDeactivate {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);

  readonly submitted = output<CreateGroupFormValue>();
  readonly cancelled = output<void>();
  readonly joinRequested = output<void>();

  protected readonly nombreInput = viewChild<FormInputComponent>('nombreInput');

  private lastSubmitTime = 0;

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
  });

  // Signal que observa el estado del formulario de forma reactiva
  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  readonly isFormInvalid = computed(() => {
    const status = this.formStatus();
    return this.form.invalid;
  });

  canDeactivate(): boolean {
    return this.isLoading() || !this.form.dirty;
  }

  protected handleEnterKey(event: KeyboardEvent): void {
    if (shouldTriggerSubmit(event)) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onSubmit(): void {
    if (!canSubmit(this.lastSubmitTime) || this.isLoading()) return;

    this.form.markAllAsTouched();

    if (this.isFormInvalid()) {
      focusInput(this.nombreInput());
      return;
    }

    this.lastSubmitTime = Date.now();
    this.formError.set(null);
    this.isLoading.set(true);
    this.submitted.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.form.reset();
    this.formError.set(null);
    this.cancelled.emit();
  }

  onJoinRequest(): void {
    this.joinRequested.emit();
  }

  completeLoading(): void {
    this.isLoading.set(false);
  }

  /**
   * Marca el formulario como exitosamente guardado.
   * Establece el formulario como pristine para permitir navegación sin diálogo de confirmación.
   * Debe llamarse tras guardar exitosamente en el servidor.
   */
  markAsSuccessful(): void {
    this.form.markAsPristine();
    this.isLoading.set(false);
  }

  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  getErrorMessage(field: 'nombre'): string {
    const control = this.form.get(field);
    const customMessages: FieldErrorMessages = {
      required: 'El nombre del grupo es obligatorio',
      minlength: 'Mínimo 3 caracteres',
      maxlength: 'Máximo 50 caracteres',
    };
    return getFieldErrorMessage(control, customMessages);
  }
}
