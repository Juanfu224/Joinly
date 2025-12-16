import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-select.html',
  styleUrl: './form-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-select' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true,
    },
  ],
})
export class FormSelectComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input<string>('Selecciona una opción');
  readonly name = input<string>('');
  readonly inputId = input<string>('');
  readonly required = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorMessage = input<string>('');

  private readonly generatedId = `form-select-${crypto.randomUUID().slice(0, 8)}`;

  readonly computedId = computed(() => this.inputId() || this.generatedId);
  readonly helpTextId = computed(() => `${this.computedId()}-help`);
  readonly errorId = computed(() => `${this.computedId()}-error`);

  readonly ariaDescribedBy = computed(() => {
    const ids = [];
    if (this.helpText()) ids.push(this.helpTextId());
    if (this.errorMessage()) ids.push(this.errorId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected value = signal<string | number>('');
  protected disabled = signal<boolean>(false);

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const numValue = Number(value);
    const finalValue = !isNaN(numValue) && value !== '' ? numValue : value;
    
    this.value.set(finalValue);
    this.onChange(finalValue);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
