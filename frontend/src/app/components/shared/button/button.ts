import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<ButtonType>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);

  buttonClasses = computed(() => {
    const classes = [
      'c-button',
      `c-button--${this.variant()}`,
      `c-button--${this.size()}`,
    ];

    if (this.fullWidth()) {
      classes.push('c-button--full-width');
    }

    return classes.join(' ');
  });
}
