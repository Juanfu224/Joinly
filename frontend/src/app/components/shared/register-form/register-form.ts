import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
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

/**
 * Componente de formulario de registro con validación y eventos avanzados.
 * 
 * **Características de eventos:**
 * - Submit con Enter desde cualquier campo (excepto textarea)
 * - Prevención de submit múltiple con throttle
 * - Enfoque automático en primer campo con error usando viewChild
 * - Gestión de eventos de teclado con @HostListener
 * 
 * @usageNotes
 * ```html
 * <app-register-form 
 *   (submitted)="handleSubmit($event)"
 *   (cancelled)="handleCancel()"
 * />
 * ```
 */
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

  /**
   * Referencias a los campos del formulario para gestión de foco
   */
  protected readonly nombreInput = viewChild<ElementRef>('nombreInput');
  protected readonly apellidoInput = viewChild<ElementRef>('apellidoInput');
  protected readonly emailInput = viewChild<ElementRef>('emailInput');
  protected readonly passwordInput = viewChild<ElementRef>('passwordInput');
  protected readonly confirmPasswordInput = viewChild<ElementRef>('confirmPasswordInput');

  /**
   * Timestamp del último submit para implementar throttle
   */
  private lastSubmitTime = 0;

  /**
   * Delay mínimo entre submits (en milisegundos)
   */
  private readonly SUBMIT_THROTTLE_MS = 1000;

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

  /**
   * Maneja el evento Enter para submit del formulario.
   * 
   * @remarks
   * Solo actúa si:
   * - El elemento activo NO es un textarea (permite Enter en textareas)
   * - El formulario es válido
   * - No está en proceso de carga
   * - Ha pasado el tiempo de throttle
   * 
   * Esto mejora la UX permitiendo submit rápido con teclado.
   * 
   * @param event - Evento de teclado
   */
  @HostListener('keydown', ['$event'])
  protected handleEnterKey(event: KeyboardEvent): void {
    // Solo procesar si es Enter
    if (event.key !== 'Enter') {
      return;
    }
    const target = event.target as HTMLElement;

    // No hacer submit si estamos en un textarea
    if (target.tagName === 'TEXTAREA') {
      return;
    }

    // Prevenir comportamiento por defecto del Enter
    event.preventDefault();

    // Intentar submit
    this.onSubmit();
  }

  /**
   * Ejecuta el submit del formulario con validación y throttle.
   * 
   * @remarks
   * Implementa throttle para prevenir múltiples submits accidentales:
   * - Verifica que haya pasado al menos SUBMIT_THROTTLE_MS desde el último submit
   * - Si el formulario es inválido, enfoca el primer campo con error
   * - Si es válido, emite el evento submitted con los valores
   */
  onSubmit(): void {
    // Verificar throttle: prevenir múltiples submits rápidos
    const now = Date.now();
    if (now - this.lastSubmitTime < this.SUBMIT_THROTTLE_MS) {
      return;
    }

    // Validar que no esté cargando
    if (this.isLoading()) {
      return;
    }

    // Marcar todos los campos como touched para mostrar errores
    this.form.markAllAsTouched();

    // Si el formulario es inválido, enfocar primer campo con error
    if (this.isFormInvalid()) {
      this.focusFirstInvalidField();
      return;
    }

    // Actualizar timestamp del último submit
    this.lastSubmitTime = now;

    // Limpiar error previo
    this.formError.set(null);

    // Activar estado de carga
    this.isLoading.set(true);

    // Emitir evento de submit
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

  /**
   * Enfoca el primer campo con error en el formulario.
   * 
   * @remarks
   * Este método demuestra el uso práctico de viewChild y ElementRef:
   * - Accede a referencias de elementos del DOM
   * - Llama al método focus() programáticamente
   * - Mejora la accesibilidad guiando al usuario al error
   * 
   * Orden de verificación: nombre → apellido → email → password → confirmPassword
   */
  private focusFirstInvalidField(): void {
    const fields: Array<{
      name: RegisterFormFields;
      ref: () => ElementRef | undefined;
    }> = [
      { name: 'nombre', ref: this.nombreInput },
      { name: 'apellido', ref: this.apellidoInput },
      { name: 'email', ref: this.emailInput },
      { name: 'password', ref: this.passwordInput },
      { name: 'confirmPassword', ref: this.confirmPasswordInput },
    ];

    for (const field of fields) {
      const control = this.form.get(field.name);
      const isInvalid = control?.invalid || 
        (field.name === 'confirmPassword' && !this.passwordsMatch());

      if (isInvalid) {
        const inputRef = field.ref();
        if (inputRef) {
          // Acceder al elemento nativo del input dentro del componente FormInput
          // FormInputComponent usa host: { class: 'c-form-input' }, así que buscamos el input dentro
          const inputElement = inputRef.nativeElement.querySelector('input') as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
          }
        }
        break;
      }
    }
  }
}
