import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../button/button';
import { FormCardComponent } from '../form-card/form-card';
import { FormInputComponent } from '../form-input/form-input';
import { FormArrayItemComponent } from '../form-array-item/form-array-item';
import { CredentialInputGroupComponent } from '../credential-input-group/credential-input-group';
import { IconComponent } from '../icon/icon';
import { canSubmit, focusInput, shouldTriggerSubmit } from '../form-utils';
import {
  getErrorMessage,
  precioMinimoPlaza,
  uniqueCredentialLabels,
  credentialFieldsRequired,
} from '../validators';

interface NewSubscriptionFormValue {
  nombre: string;
  precioTotal: number;
  frecuencia: 'mensual' | 'anual';
  plazas: number;
  credenciales: Array<{
    tipo: string;
    etiqueta: string;
    valor: string;
    password: string;
    instrucciones: string;
    visibleParaMiembros: boolean;
  }>;
}

@Component({
  selector: 'app-new-subscription-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormInputComponent,
    FormCardComponent,
    ButtonComponent,
    FormArrayItemComponent,
    CredentialInputGroupComponent,
    IconComponent,
  ],
  templateUrl: './new-subscription-form.html',
  styleUrl: './new-subscription-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-new-subscription-form' },
})
export class NewSubscriptionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  
  readonly submitted = output<NewSubscriptionFormValue>();
  readonly cancelled = output<void>();

  protected readonly nombreInput = viewChild<FormInputComponent>('nombreInput');
  protected readonly precioInput = viewChild<FormInputComponent>('precioInput');
  protected readonly plazasInput = viewChild<FormInputComponent>('plazasInput');

  private lastSubmitTime = 0;

  readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      precioTotal: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(9999)]],
      frecuencia: ['mensual' as 'mensual' | 'anual', [Validators.required]],
      plazas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(20)]],
      credenciales: this.fb.array(
        [],
        [Validators.minLength(1), Validators.maxLength(10), uniqueCredentialLabels()]
      ),
    },
    {
      validators: [precioMinimoPlaza(1)],
    }
  );

  /** Getter para acceder al FormArray de credenciales */
  get credenciales(): FormArray {
    return this.form.get('credenciales') as FormArray;
  }

  /** Crea un nuevo FormGroup de credencial */
  private newCredencial(): FormGroup {
    return this.fb.group(
      {
        tipo: ['USUARIO_PASSWORD', [Validators.required]],
        etiqueta: ['', [Validators.required, Validators.maxLength(50)]],
        valor: ['', [Validators.required]],
        password: [''],
        instrucciones: [''],
        visibleParaMiembros: [true],
      },
      { validators: [credentialFieldsRequired()] }
    );
  }

  /** Agrega una nueva credencial al array */
  addCredencial(): void {
    if (this.credenciales.length >= 10) return;
    this.credenciales.push(this.newCredencial());
  }

  /** Elimina una credencial del array */
  removeCredencial(index: number): void {
    if (this.credenciales.length > 1) {
      this.credenciales.removeAt(index);
    }
  }

  // Signal que observa el estado del formulario de forma reactiva
  private readonly formStatus = toSignal(this.form.statusChanges, { 
    initialValue: this.form.status 
  });

  readonly isFormInvalid = computed(() => {
    const status = this.formStatus();
    return this.form.invalid;
  });

  ngOnInit(): void {
    // Inicializar con una credencial por defecto
    this.addCredencial();
  }

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
      credenciales: rawValue.credenciales as NewSubscriptionFormValue['credenciales'],
    };
    
    this.submitted.emit(value);
  }

  onCancel(): void {
    this.form.reset({ frecuencia: 'mensual' });
    this.credenciales.clear();
    this.addCredencial();
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

    const customMessages: Record<string, string> = {
      required: `${fieldLabels[field] || 'Este campo'} es obligatorio`,
      minlength: 'Mínimo 2 caracteres',
      maxlength: 'Máximo 100 caracteres',
      min: field === 'precioTotal' ? 'El precio debe ser mayor a 0' : 'El valor mínimo es 1',
      max: field === 'precioTotal' ? 'El precio máximo es 9999€' : 'El valor máximo es 20',
    };

    return getErrorMessage(control, customMessages);
  }

  getFormErrorMessages(): string[] {
    const errors: string[] = [];

    if (this.form.errors?.['precioMinimoPlaza']) {
      const error = this.form.errors['precioMinimoPlaza'];
      errors.push(`Precio mínimo por persona: ${error.min}€ (actual: ${error.actual.toFixed(2)}€)`);
    }

    const credencialesControl = this.form.get('credenciales');
    if (credencialesControl?.errors?.['minlength']) {
      errors.push('Debes agregar al menos una credencial');
    }

    if (credencialesControl?.errors?.['maxlength']) {
      errors.push('Máximo 10 credenciales permitidas');
    }

    if (credencialesControl?.errors?.['duplicateLabels']) {
      const duplicates = credencialesControl.errors['duplicateLabels'].duplicates;
      errors.push(`Etiquetas duplicadas: ${duplicates.join(', ')}`);
    }

    return errors;
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
