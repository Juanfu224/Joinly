import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginFormComponent } from '../../../components/shared';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

/**
 * Página Login - Autenticación de usuario.
 *
 * Página simple centrada con formulario de login.
 * Sin header/footer para mantener focus en la acción principal.
 *
 * ### Flujo:
 * 1. Usuario ingresa credenciales
 * 2. LoginFormComponent valida y emite submit
 * 3. AuthService.login() procesa (mock)
 * 4. Si éxito: redirige a dashboard o returnUrl
 * 5. Si error: muestra mensaje en formulario
 *
 * @usageNotes
 * Ruta pública, accesible sin autenticación.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  protected readonly loginForm = viewChild.required<LoginFormComponent>(LoginFormComponent);

  /**
   * Maneja el submit del formulario de login.
   * Usa `replaceUrl: true` para evitar volver al formulario con botón "Atrás".
   */
  protected onLoginSubmit(data: { email: string; password: string }): void {
    this.authService.login(data).subscribe({
      next: (user) => {
        this.toastService.success(`¡Bienvenido, ${user.nombre}!`);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl], { replaceUrl: true });
      },
      error: (error) => {
        const message = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        this.loginForm().setError(message);
        // No llamamos a toastService.error() aquí porque el errorInterceptor ya muestra el toast automáticamente
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
   * Maneja la solicitud de ir a registro.
   * Navega a /register.
   */
  protected onRegisterRequest(): void {
    this.router.navigate(['/register']);
  }
}
