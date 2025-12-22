import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { generateShortId } from '../../../utils/uuid';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-form-input' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly name = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly inputId = input<string>('');
  readonly required = input<boolean>(false);
  readonly helpText = input<string>('');
  readonly errorMessage = input<string>('');
  readonly pending = input<boolean>(false);
  readonly pendingMessage = input<string>('Verificando...');
  /** Muestra mensaje de éxito cuando el campo es válido */
  readonly showSuccess = input<boolean>(false);
  readonly successMessage = input<string>('¡Campo válido!');

  private readonly generatedId = generateShortId('form-input');

  readonly computedId = computed(() => this.inputId() || this.generatedId);
  readonly helpTextId = computed(() => `${this.computedId()}-help`);
  readonly errorId = computed(() => `${this.computedId()}-error`);

  readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.errorMessage()) ids.push(this.errorId());
    if (this.helpText()) ids.push(this.helpTextId());
    return ids.length > 0 ? ids.join(' ') : null;
  });

  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  focus(): void {
    this.inputElement()?.nativeElement.focus();
  }

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

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
