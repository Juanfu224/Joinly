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

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-form-radio-group',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-radio-group.html',
  styleUrl: './form-radio-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-radio-group' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormRadioGroupComponent),
      multi: true,
    },
  ],
})
export class FormRadioGroupComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly options = input.required<RadioOption[]>();
  readonly name = input<string>('');
  readonly groupId = input<string>('');
  readonly required = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly inline = input<boolean>(false);

  private readonly generatedGroupId = `form-radio-${crypto.randomUUID().slice(0, 8)}`;

  readonly computedGroupId = computed(() => this.groupId() || this.generatedGroupId);
  readonly helpTextId = computed(() => `${this.computedGroupId()}-help`);
  readonly errorId = computed(() => `${this.computedGroupId()}-error`);

  readonly ariaDescribedBy = computed(() => {
    const ids = [];
    if (this.helpText()) ids.push(this.helpTextId());
    if (this.errorMessage()) ids.push(this.errorId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected value = signal<string | number | null>(null);
  protected disabled = signal<boolean>(false);

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number): void {
    this.value.set(value ?? null);
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

  protected onRadioChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const numValue = Number(value);
    const finalValue = !isNaN(numValue) && value !== '' ? numValue : value;
    
    this.value.set(finalValue);
    this.onChange(finalValue);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected getRadioId(index: number): string {
    return `${this.computedGroupId()}-option-${index}`;
  }
}
