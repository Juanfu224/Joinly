import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input';

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
  imports: [ReactiveFormsModule, FormInputComponent],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-register-form' },
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = output<RegisterFormValue>();
  readonly cancelled = output<void>();

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  readonly passwordsMatch = computed(() => {
    const { password, confirmPassword } = this.form.value;
    return password === confirmPassword;
  });

  readonly isFormInvalid = computed(() => {
    return this.form.invalid || !this.passwordsMatch();
  });

  onSubmit(): void {
    if (this.isFormInvalid() || this.isLoading()) return;

    this.formError.set(null);
    this.isLoading.set(true);
    this.submitted.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.form.reset();
    this.formError.set(null);
    this.cancelled.emit();
  }

  getErrorMessage(field: RegisterFormFields): string {
    const control = this.form.get(field);
    if (!control?.touched || !control?.errors) {
      if (field === 'confirmPassword' && control?.touched && !this.passwordsMatch()) {
        return 'Las contraseñas no coinciden';
      }
      return '';
    }

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Introduce un email válido';
    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength as number;
      return `Mínimo ${min} caracteres`;
    }

    return '';
  }
}
