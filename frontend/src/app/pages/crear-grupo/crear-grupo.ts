import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateGroupFormComponent } from '../../components/shared/create-group-form/create-group-form';
import type { CanComponentDeactivate } from '../../guards';
import { UnidadFamiliarService, ToastService } from '../../services';
import { CreateUnidadRequest } from '../../models';

/**
 * Página para crear una nueva unidad familiar.
 * Ruta: /crear-grupo (protegida por authGuard y pendingChangesGuard)
 */
@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [CreateGroupFormComponent],
  templateUrl: './crear-grupo.html',
  styleUrl: './crear-grupo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearGrupoComponent implements CanComponentDeactivate {
  private readonly router = inject(Router);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly toastService = inject(ToastService);

  readonly formComponent = viewChild(CreateGroupFormComponent);

  canDeactivate(): boolean {
    return this.formComponent()?.canDeactivate() ?? true;
  }

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
