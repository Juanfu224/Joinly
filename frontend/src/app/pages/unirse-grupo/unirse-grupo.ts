import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JoinGroupFormComponent } from '../../components/shared/join-group-form/join-group-form';
import { SolicitudService, ToastService } from '../../services';
import { CreateSolicitudGrupoRequest } from '../../models';

/**
 * Página para unirse a un grupo familiar existente.
 * 
 * Contiene el formulario de código y maneja la comunicación con el servicio.
 * Fondo azul claro según diseño Figma.
 */
@Component({
  selector: 'app-unirse-grupo',
  standalone: true,
  imports: [JoinGroupFormComponent],
  templateUrl: './unirse-grupo.html',
  styleUrl: './unirse-grupo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnirseGrupoComponent {
  private readonly router = inject(Router);
  private readonly solicitudService = inject(SolicitudService);
  private readonly toastService = inject(ToastService);

  // Referencia al formulario para controlar estado de carga
  readonly formComponent = viewChild(JoinGroupFormComponent);

  /**
   * Maneja el envío del formulario de unión
   */
  protected onJoinSubmitted(data: { codigo: string }): void {
    const request: CreateSolicitudGrupoRequest = {
      codigoInvitacion: data.codigo
    };

    this.solicitudService.unirseGrupo(request).subscribe({
      next: () => {
        this.toastService.show('success', 'Solicitud enviada correctamente');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        let msg = 'Error al unirse al grupo';
        if (error.status === 409) msg = 'Ya eres miembro o tienes una solicitud pendiente';
        else if (error.status === 404) msg = 'Código de invitación inválido';
        else if (error.error?.message) msg = error.error.message;
        
        this.toastService.show('error', msg);
        this.formComponent()?.setError(msg);
      }
    });
  }

  /**
   * Redirige al dashboard si se cancela la operación
   */
  protected onExited(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Redirige a la página de crear grupo
   */
  protected onCreateRequested(): void {
    this.router.navigate(['/crear-grupo']);
  }
}
