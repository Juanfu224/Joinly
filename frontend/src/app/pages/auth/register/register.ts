import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterFormComponent } from '../../../components/shared';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

/**
 * Página Register - Registro de nuevo usuario.
 *
 * Página simple centrada con formulario de registro.
 * Sin header/footer para mantener focus en la acción principal.
 *
 * ### Flujo:
 * 1. Usuario ingresa datos de registro
 * 2. RegisterFormComponent valida y emite submit
 * 3. AuthService.register() procesa (mock)
 * 4. Si éxito: autentica automáticamente y redirige a dashboard
 * 5. Si error: muestra mensaje en formulario
 *
 * @usageNotes
 * Ruta pública, accesible sin autenticación.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegisterFormComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly registerForm =
    viewChild.required<RegisterFormComponent>(RegisterFormComponent);

  /**
   * Maneja el submit del formulario de registro.
   * Usa `replaceUrl: true` para evitar re-submit con botón "Atrás".
   */
  protected onRegisterSubmit(data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): void {
    const registerData = {
      nombre: `${data.nombre} ${data.apellido}`.trim(),
      email: data.email,
      password: data.password,
    };

    this.authService.register(registerData).subscribe({
      next: (user) => {
        this.toastService.success(`¡Cuenta creada! Bienvenido, ${user.nombre}!`);
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (error) => {
        const message = error.message || 'Error al crear la cuenta. Intenta de nuevo.';
        this.registerForm().setError(message);
        this.toastService.error(message);
      },
    });
  }

  /**
   * Maneja la cancelación del formulario.
   * Vuelve a la página principal.
   */
  protected onCancel(): void {
    this.router.navigate(['/']);
  }

  /**
   * Maneja la solicitud de ir a login.
   * Navega a /login.
   */
  protected onLoginRequest(): void {
    this.router.navigate(['/login']);
  }
}
