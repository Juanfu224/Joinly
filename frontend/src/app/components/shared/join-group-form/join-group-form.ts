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
import { canSubmit, focusInput, shouldTriggerSubmit } from '../form-utils';
import {
  codePatternValidator,
  getFieldErrorMessage,
  type FieldErrorMessages,
} from '../form-validators';
import { AsyncValidatorsService } from '../../../services';

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
  private readonly asyncValidators = inject(AsyncValidatorsService);

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);

  readonly submitted = output<JoinGroupFormValue>();
  readonly cancelled = output<void>();
  readonly createRequested = output<void>();

  protected readonly codigoInput = viewChild<FormInputComponent>('codigoInput');

  private lastSubmitTime = 0;

  readonly form = this.fb.group({
    codigo: [
      '',
      {
        validators: [Validators.required, codePatternValidator(12)],
        asyncValidators: [this.asyncValidators.groupCodeExists()],
        updateOn: 'blur' as const,
      },
    ],
  });

  // Signal que observa el estado del formulario de forma reactiva
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
    const customMessages: FieldErrorMessages = {
      required: 'El código del grupo es obligatorio',
      codePattern: 'Formato válido: XXXX-XXXX-XXXX (12 caracteres alfanuméricos)',
      groupCodeNotFound: 'No existe ningún grupo con este código',
    };
    return getFieldErrorMessage(control, customMessages);
  }

  /** Indica si el campo de código está pendiente de validación asíncrona */
  get isCodePending(): boolean {
    return this.form.get('codigo')?.pending ?? false;
  }

  /** Indica si mostrar feedback de success para el campo de código */
  get showCodeSuccess(): boolean {
    const control = this.form.get('codigo');
    return !!(control?.valid && control.dirty && !control.pending && control.value);
  }
}
