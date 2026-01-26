import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  CardComponent,
  FormInputComponent,
  IconComponent,
  SpinnerOverlayComponent,
} from '../../../components/shared';
import {
  AuthService,
  ModalService,
  ThemeService,
  ToastService,
  UsuarioService,
} from '../../../services';

function passwordMatchValidator(control: AbstractControl) {
  const newPass = control.get('nuevaContrasena');
  const confirmPass = control.get('confirmarContrasena');

  if (newPass && confirmPass && newPass.value !== confirmPass.value) {
    confirmPass.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

/**
 * Página de configuración de la cuenta.
 * Permite cambiar tema, contraseña y eliminar cuenta.
 *
 * @route /usuario/configuracion
 */
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    FormInputComponent,
    IconComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionComponent {
  readonly #authService = inject(AuthService);
  readonly #usuarioService = inject(UsuarioService);
  readonly #toastService = inject(ToastService);
  readonly #themeService = inject(ThemeService);
  readonly #modalService = inject(ModalService);
  readonly #fb = inject(FormBuilder);

  protected readonly usuario = this.#authService.currentUser;
  protected readonly currentTheme = this.#themeService.currentTheme;
  protected readonly isChangingPassword = signal(false);
  protected readonly isSaving = signal(false);

  protected readonly passwordForm = this.#fb.nonNullable.group(
    {
      contrasenaActual: ['', [Validators.required]],
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  protected readonly canSubmitPassword = computed(
    () => this.passwordForm.valid && !this.isSaving(),
  );

  protected readonly passwordErrors = computed(() => {
    if (this.passwordForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  });

  protected onTogglePasswordChange(): void {
    this.isChangingPassword.update((v) => !v);
    if (!this.isChangingPassword()) {
      this.passwordForm.reset();
    }
  }

  protected onChangePassword(): void {
    if (!this.passwordForm.valid || this.isSaving()) return;

    const { contrasenaActual, nuevaContrasena, confirmarContrasena } =
      this.passwordForm.getRawValue();

    if (nuevaContrasena !== confirmarContrasena) {
      this.#toastService.error('Las contraseñas no coinciden');
      return;
    }

    this.isSaving.set(true);

    this.#usuarioService.cambiarContrasena({ contrasenaActual, nuevaContrasena }).subscribe({
      next: () => {
        this.#toastService.success('Contraseña cambiada exitosamente');
        this.passwordForm.reset();
        this.isChangingPassword.set(false);
        this.isSaving.set(false);
      },
      error: (error) => {
        this.#toastService.error(error.message || 'Error al cambiar la contraseña');
        this.isSaving.set(false);
      },
    });
  }

  protected onToggleTheme(): void {
    this.#themeService.toggleTheme();
    const newTheme = this.currentTheme();
    this.#toastService.success(`Tema cambiado a modo ${newTheme === 'dark' ? 'oscuro' : 'claro'}`);
  }

  protected onOpenDeleteModal(): void {
    this.#modalService.open({
      title: '¿Eliminar cuenta permanentemente?',
      content: `
        <p><strong>Esta acción es permanente e irreversible.</strong></p>
        <p>Al eliminar tu cuenta:</p>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          <li>Se eliminarán todos tus datos personales</li>
          <li>Perderás acceso a todos los grupos</li>
          <li>Se cancelarán todas tus suscripciones activas</li>
        </ul>
      `,
      confirmText: 'Eliminar cuenta',
      cancelText: 'Cancelar',
      onConfirm: () => this.#deleteAccount(),
    });
  }

  #deleteAccount(): void {
    const user = this.usuario();
    if (!user) return;

    this.isSaving.set(true);

    this.#usuarioService.desactivarCuenta(user.id).subscribe({
      next: () => {
        this.#toastService.success('Cuenta eliminada exitosamente. Hasta pronto.');
        this.#authService.logout();
      },
      error: (error) => {
        this.#toastService.error(error.message || 'Error al eliminar la cuenta');
        this.isSaving.set(false);
      },
    });
  }
}
