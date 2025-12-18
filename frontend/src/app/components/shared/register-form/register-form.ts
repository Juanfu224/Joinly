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
import {
  getErrorMessage,
  matchFields,
  passwordStrength,
} from '../validators';
import { AsyncValidatorsService } from '../../../services';

type RegisterFormFields = 'nombre' | 'apellido' | 'email' | 'password' | 'confirmPassword';

interface RegisterFormValue {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormCardComponent, ButtonComponent],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-register-form' },
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly asyncValidators = inject(AsyncValidatorsService);

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = output<RegisterFormValue>();
  readonly cancelled = output<void>();
  readonly loginRequested = output<void>();

  protected readonly nombreInput = viewChild<FormInputComponent>('nombreInput');
  protected readonly apellidoInput = viewChild<FormInputComponent>('apellidoInput');
  protected readonly emailInput = viewChild<FormInputComponent>('emailInput');
  protected readonly passwordInput = viewChild<FormInputComponent>('passwordInput');
  protected readonly confirmPasswordInput = viewChild<FormInputComponent>('confirmPasswordInput');

  private lastSubmitTime = 0;

  readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.asyncValidators.emailAvailable()],
        updateOn: 'blur'
      }],
      password: ['', [Validators.required, passwordStrength({ minLength: 8, requireNumber: true })]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchFields('password', 'confirmPassword') }
  );

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

  onLoginRequest(): void {
    this.loginRequested.emit();
  }

  completeLoading(): void {
    this.isLoading.set(false);
  }

  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  getErrorMessage(field: RegisterFormFields): string {
    const control = this.form.get(field);

    // Error especial para confirmPassword si los campos no coinciden
    if (field === 'confirmPassword' && this.form.errors?.['fieldsMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    const customMessages: Record<string, string> = {
      required: 'Este campo es obligatorio',
      minlength: 'Mínimo 2 caracteres',
      noNumber: 'La contraseña debe contener al menos un número',
    };

    return getErrorMessage(control, customMessages);
  }

  private focusFirstInvalidField(): void {
    const inputMap = {
      nombre: this.nombreInput,
      apellido: this.apellidoInput,
      email: this.emailInput,
      password: this.passwordInput,
      confirmPassword: this.confirmPasswordInput,
    } as const;

    for (const [fieldName, inputFn] of Object.entries(inputMap)) {
      const control = this.form.get(fieldName);
      const isInvalid =
        control?.invalid ||
        (fieldName === 'confirmPassword' && this.form.errors?.['fieldsMismatch']);

      if (isInvalid) {
        focusInput(inputFn());
        break;
      }
    }
  }
}
