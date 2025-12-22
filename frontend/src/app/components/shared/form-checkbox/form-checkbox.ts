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
import { generateShortId } from '../../../utils/uuid';

@Component({
  selector: 'app-form-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-checkbox.html',
  styleUrl: './form-checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-checkbox' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormCheckboxComponent),
      multi: true,
    },
  ],
})
export class FormCheckboxComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly name = input<string>('');
  readonly inputId = input<string>('');
  readonly required = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorMessage = input<string>('');

  private readonly generatedId = generateShortId('form-checkbox');

  readonly computedId = computed(() => this.inputId() || this.generatedId);
  readonly helpTextId = computed(() => `${this.computedId()}-help`);
  readonly errorId = computed(() => `${this.computedId()}-error`);

  readonly ariaDescribedBy = computed(() => {
    const ids = [];
    if (this.helpText()) ids.push(this.helpTextId());
    if (this.errorMessage()) ids.push(this.errorId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected checked = signal<boolean>(false);
  protected disabled = signal<boolean>(false);

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checked.set(checked);
    this.onChange(checked);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
