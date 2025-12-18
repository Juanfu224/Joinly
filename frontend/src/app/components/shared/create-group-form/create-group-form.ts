import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../button/button';
import { FormCardComponent } from '../form-card/form-card';
import { FormInputComponent } from '../form-input/form-input';
import { canSubmit, focusInput, shouldTriggerSubmit } from '../form-utils';

interface CreateGroupFormValue {
  nombre: string;
}

@Component({
  selector: 'app-create-group-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormCardComponent, ButtonComponent],
  templateUrl: './create-group-form.html',
  styleUrl: './create-group-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-create-group-form' },
})
export class CreateGroupFormComponent {
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

  readonly isFormInvalid = computed(() => this.form.invalid);

  @HostListener('keydown', ['$event'])
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

  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  getErrorMessage(field: 'nombre'): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';

    const errors: Record<string, string> = {
      required: 'El nombre es obligatorio',
      minlength: 'Mínimo 3 caracteres',
      maxlength: 'Máximo 50 caracteres',
    };

    const errorKey = Object.keys(control.errors)[0];
    return errors[errorKey] || 'Campo inválido';
  }
}
