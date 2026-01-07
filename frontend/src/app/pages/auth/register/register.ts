import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterFormComponent, LogoComponent } from '../../../components/shared';
import { AuthService } from '../../../services/auth';
import { AlertService } from '../../../services/alert';

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
  imports: [RegisterFormComponent, LogoComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  /**
   * Maneja el submit del formulario de registro.
   * Llama a AuthService y gestiona redirección o error.
   */
  protected onRegisterSubmit(data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): void {
    // Mapear datos del formulario al formato que espera AuthService
    const registerData = {
      email: data.email,
      password: data.password,
      nombreUsuario: data.email.split('@')[0],
      nombreCompleto: `${data.nombre} ${data.apellido}`,
    };

    this.authService.register(registerData).subscribe({
      next: (user) => {
        // Guardar usuario en state (auto-login)
        this.authService.setUser(user);

        // Mostrar mensaje de éxito
        this.alertService.success(`¡Cuenta creada! Bienvenido, ${user.nombreUsuario}!`);

        // Redirigir a dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        // Mostrar error en formulario
        const message = error.message || 'Error al crear la cuenta. Intenta de nuevo.';
        this.alertService.error(message);
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
