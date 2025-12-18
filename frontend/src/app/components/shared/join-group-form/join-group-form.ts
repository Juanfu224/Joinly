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

interface JoinGroupFormValue {
  codigo: string;
}

@Component({
  selector: 'app-join-group-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormCardComponent, ButtonComponent],
  templateUrl: './join-group-form.html',
  styleUrl: './join-group-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-join-group-form' },
})
export class JoinGroupFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  
  readonly submitted = output<JoinGroupFormValue>();
  readonly cancelled = output<void>();
  readonly createRequested = output<void>();

  protected readonly codigoInput = viewChild<FormInputComponent>('codigoInput');

  private lastSubmitTime = 0;
  private readonly codigoPattern = /^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/;

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(this.codigoPattern)]],
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
      focusInput(this.codigoInput());
      return;
    }

    this.lastSubmitTime = Date.now();
    this.formError.set(null);
    this.isLoading.set(true);
    
    const codigo = this.form.get('codigo')?.value.replace(/-/g, '').toUpperCase() || '';
    this.submitted.emit({ codigo });
  }

  onCancel(): void {
    this.form.reset();
    this.formError.set(null);
    this.cancelled.emit();
  }

  onCreateRequest(): void {
    this.createRequested.emit();
  }

  completeLoading(): void {
    this.isLoading.set(false);
  }

  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  getErrorMessage(field: 'codigo'): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';

    const errors: Record<string, string> = {
      required: 'El código es obligatorio',
      pattern: 'Formato: XXXX-XXXX-XXXX',
    };

    const errorKey = Object.keys(control.errors)[0];
    return errors[errorKey] || 'Campo inválido';
  }
}
