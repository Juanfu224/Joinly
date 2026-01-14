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
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../button/button';
import { FormCardComponent } from '../form-card/form-card';
import { FormInputComponent } from '../form-input/form-input';
import { FormSelectComponent, type SelectOption } from '../form-select/form-select';
import { canSubmit, focusInput, shouldTriggerSubmit } from '../form-utils';
import { getErrorMessage, precioMinimoPlaza } from '../validators';

/**
 * Datos del formulario de nueva suscripción.
 * Estructura simplificada según diseño Figma.
 */
export interface NewSubscriptionFormValue {
  nombre: string;
  precioTotal: number;
  plazas: number;
  periodicidad: 'MENSUAL' | 'ANUAL';
  credencialUsuario?: string;
  credencialPassword?: string;
}

/**
 * Formulario para crear una nueva suscripción.
 *
 * Diseño simple basado en Figma:
 * - Nombre del servicio (requerido)
 * - Precio total (requerido)
 * - Número de plazas (requerido)
 * - Periodicidad (requerido)
 * - Credenciales de acceso (opcionales)
 *
 * @usageNotes
 * ```html
 * <app-new-subscription-form
 *   (submitted)="onSubmit($event)"
 *   (cancelled)="onCancel()"
 * />
 * ```
 */
@Component({
  selector: 'app-new-subscription-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormCardComponent,
    ButtonComponent,
  ],
  templateUrl: './new-subscription-form.html',
  styleUrl: './new-subscription-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-new-subscription-form' },
})
export class NewSubscriptionFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = output<NewSubscriptionFormValue>();
  readonly cancelled = output<void>();

  protected readonly nombreInput = viewChild<FormInputComponent>('nombreInput');
  protected readonly precioInput = viewChild<FormInputComponent>('precioInput');
  protected readonly plazasInput = viewChild<FormInputComponent>('plazasInput');

  private lastSubmitTime = 0;

  readonly periodicidadOptions: SelectOption[] = [
    { value: 'MENSUAL', label: 'Mensual' },
    { value: 'ANUAL', label: 'Anual' },
  ];

  readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      precioTotal: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(9999)]],
      plazas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(20)]],
      periodicidad: ['MENSUAL' as 'MENSUAL' | 'ANUAL', [Validators.required]],
      credencialUsuario: [''],
      credencialPassword: [''],
    },
    {
      validators: [precioMinimoPlaza(1)],
    }
  );

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  readonly isFormInvalid = computed(() => {
    const status = this.formStatus();
    return this.form.invalid;
  });

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

    const rawValue = this.form.getRawValue();
    const value: NewSubscriptionFormValue = {
      nombre: rawValue.nombre,
      precioTotal: rawValue.precioTotal!,
      plazas: rawValue.plazas!,
      periodicidad: rawValue.periodicidad,
      credencialUsuario: rawValue.credencialUsuario || undefined,
      credencialPassword: rawValue.credencialPassword || undefined,
    };

    this.submitted.emit(value);
  }

  onCancel(): void {
    this.form.reset({ periodicidad: 'MENSUAL' });
    this.formError.set(null);
    this.cancelled.emit();
  }

  /** Completa el estado de carga (llamado desde el padre) */
  completeLoading(): void {
    this.isLoading.set(false);
  }

  /** Establece un error en el formulario (llamado desde el padre) */
  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  /** Obtiene el mensaje de error para un campo específico */
  getErrorMessage(field: keyof typeof this.form.controls): string {
    const control = this.form.get(field);

    const fieldLabels: Record<string, string> = {
      nombre: 'El nombre',
      precioTotal: 'El precio',
      plazas: 'El número de plazas',
      periodicidad: 'La periodicidad',
    };

    const customMessages: Record<string, string> = {
      required: `${fieldLabels[field] || 'Este campo'} es obligatorio`,
      minlength: 'Mínimo 2 caracteres',
      maxlength: 'Máximo 100 caracteres',
      min: field === 'precioTotal' ? 'El precio debe ser mayor a 0' : 'El valor mínimo es 1',
      max: field === 'precioTotal' ? 'El precio máximo es 9999€' : 'El valor máximo es 20',
    };

    return getErrorMessage(control, customMessages);
  }

  /** Obtiene errores de validación a nivel de formulario */
  getFormErrorMessages(): string[] {
    const errors: string[] = [];

    if (this.form.errors?.['precioMinimoPlaza']) {
      const error = this.form.errors['precioMinimoPlaza'];
      errors.push(`Precio mínimo por persona: ${error.min}€ (actual: ${error.actual.toFixed(2)}€)`);
    }

    return errors;
  }

  /** Enfoca el primer campo inválido */
  private focusFirstInvalidField(): void {
    const inputMap = {
      nombre: this.nombreInput,
      precioTotal: this.precioInput,
      plazas: this.plazasInput,
    } as const;

    for (const [field, inputFn] of Object.entries(inputMap)) {
      if (this.form.get(field)?.invalid) {
        focusInput(inputFn());
        break;
      }
    }
  }
}
