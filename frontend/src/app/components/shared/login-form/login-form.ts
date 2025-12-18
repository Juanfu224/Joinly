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
import { getFieldErrorMessage, type FieldErrorMessages } from '../form-validators';

interface LoginFormValue {
  email: string;
  password: string;
}

/**
 * Componente de formulario de inicio de sesión.
 * 
 * **Características:**
 * - Validación de email y contraseña
 * - Submit con Enter desde cualquier campo
 * - Prevención de submit múltiple con throttle
 * - Diseño según especificaciones de Figma
 * 
 * @usageNotes
 * ```html
 * <app-login-form 
 *   (submitted)="handleLogin($event)"
 *   (cancelled)="handleCancel()"
 *   (registerRequested)="goToRegister()"
 * />
 * ```
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormCardComponent, ButtonComponent],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-login-form' },
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  
  readonly submitted = output<LoginFormValue>();
  readonly cancelled = output<void>();
  readonly registerRequested = output<void>();

  protected readonly emailInput = viewChild<FormInputComponent>('emailInput');
  protected readonly passwordInput = viewChild<FormInputComponent>('passwordInput');

  private lastSubmitTime = 0;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
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
      this.focusFirstInvalidField();
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

  onRegisterRequest(): void {
    this.registerRequested.emit();
  }

  completeLoading(): void {
    this.isLoading.set(false);
  }

  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  getErrorMessage(field: 'email' | 'password'): string {
    const control = this.form.get(field);
    const customMessages: FieldErrorMessages = {
      required: field === 'email' ? 'El email es obligatorio' : 'La contraseña es obligatoria',
      minlength: 'Mínimo 8 caracteres',
    };
    return getFieldErrorMessage(control, customMessages);
  }

  private focusFirstInvalidField(): void {
    if (this.form.get('email')?.invalid) {
      focusInput(this.emailInput());
    } else if (this.form.get('password')?.invalid) {
      focusInput(this.passwordInput());
    }
  }
}
