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

interface NewSubscriptionFormValue {
  nombre: string;
  precioTotal: number;
  frecuencia: 'mensual' | 'anual';
  plazas: number;
  password?: string;
  usuario?: string;
}

@Component({
  selector: 'app-new-subscription-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormCardComponent, ButtonComponent],
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

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    precioTotal: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(9999)]],
    frecuencia: ['mensual' as 'mensual' | 'anual', [Validators.required]],
    plazas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(20)]],
    usuario: [''],
    password: [''],
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
    
    const rawValue = this.form.getRawValue();
    const value: NewSubscriptionFormValue = {
      nombre: rawValue.nombre,
      precioTotal: rawValue.precioTotal!,
      frecuencia: rawValue.frecuencia,
      plazas: rawValue.plazas!,
      ...(rawValue.usuario && { usuario: rawValue.usuario }),
      ...(rawValue.password && { password: rawValue.password }),
    };
    
    this.submitted.emit(value);
  }

  onCancel(): void {
    this.form.reset({ frecuencia: 'mensual' });
    this.formError.set(null);
    this.cancelled.emit();
  }

  completeLoading(): void {
    this.isLoading.set(false);
  }

  setError(message: string): void {
    this.formError.set(message);
    this.isLoading.set(false);
  }

  getErrorMessage(field: keyof typeof this.form.controls): string {
    const control = this.form.get(field);

    const fieldLabels: Record<string, string> = {
      nombre: 'El nombre',
      precioTotal: 'El precio',
      frecuencia: 'La frecuencia',
      plazas: 'El número de plazas',
    };

    const customMessages: FieldErrorMessages = {
      required: `${fieldLabels[field] || 'Este campo'} es obligatorio`,
      minlength: 'Mínimo 2 caracteres',
      maxlength: 'Máximo 100 caracteres',
      min: field === 'precioTotal' ? 'El precio debe ser mayor a 0' : 'El valor mínimo es 1',
      max: field === 'precioTotal' ? 'El precio máximo es 9999€' : 'El valor máximo es 20',
    };

    return getFieldErrorMessage(control, customMessages);
  }

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
