import { generateShortId } from '../../../utils/uuid';
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

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-textarea.html',
  styleUrl: './form-textarea.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-textarea' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormTextareaComponent),
      multi: true,
    },
  ],
})
export class FormTextareaComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly name = input<string>('');
  readonly inputId = input<string>('');
  readonly required = input<boolean>(false);
  readonly rows = input<number>(4);
  readonly maxLength = input<number | undefined>(undefined);
  readonly helpText = input<string>('');
  readonly errorMessage = input<string>('');

  private readonly generatedId = generateShortId('form-textarea');

  readonly computedId = computed(() => this.inputId() || this.generatedId);
  readonly helpTextId = computed(() => `${this.computedId()}-help`);
  readonly errorId = computed(() => `${this.computedId()}-error`);

  readonly ariaDescribedBy = computed(() => {
    const ids = [];
    if (this.helpText()) ids.push(this.helpTextId());
    if (this.errorMessage()) ids.push(this.errorId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected value = signal<string>('');
  protected disabled = signal<boolean>(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
