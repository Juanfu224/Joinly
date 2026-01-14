import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateGroupFormComponent } from '../../components/shared/create-group-form/create-group-form';
import { UnidadFamiliarService, ToastService } from '../../services';
import { CreateUnidadRequest } from '../../models';

/**
 * Página para crear una nueva unidad familiar.
 * 
 * Contiene el formulario de creación y maneja la comunicación con el servicio.
 * Fondo naranja claro según diseño Figma.
 */
@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [CreateGroupFormComponent],
  templateUrl: './crear-grupo.html',
  styleUrl: './crear-grupo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearGrupoComponent {
  private readonly router = inject(Router);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly toastService = inject(ToastService);

  // Referencia al formulario para controlar estado de carga
  readonly formComponent = viewChild(CreateGroupFormComponent);

  /**
   * Crea una nueva unidad familiar.
   * Usa `replaceUrl: true` para evitar duplicados con botón "Atrás".
   */
  protected onGroupSubmitted(data: { nombre: string }): void {
    this.unidadService.crearUnidad({ nombre: data.nombre }).subscribe({
      next: () => {
        this.toastService.show('success', 'Grupo creado exitosamente');
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (error) => {
        const msg = error.error?.message || 'Error al crear el grupo';
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
   * Redirige a la página de unirse a grupo
   */
  protected onJoinRequested(): void {
    this.router.navigate(['/unirse-grupo']);
  }
}
