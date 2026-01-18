import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  NewSubscriptionFormComponent,
  type NewSubscriptionFormValue,
} from '../../components/shared';
import type { CanComponentDeactivate } from '../../guards';
import { SuscripcionService, ToastService } from '../../services';
import type { CreateSuscripcionRequest, Periodicidad, SuscripcionResponse } from '../../models';

/**
 * Página para crear una nueva suscripción.
 * Ruta: /grupos/:id/crear-suscripcion (protegida por authGuard y pendingChangesGuard)
 */
@Component({
  selector: 'app-crear-suscripcion',
  standalone: true,
  imports: [NewSubscriptionFormComponent],
  templateUrl: './crear-suscripcion.html',
  styleUrl: './crear-suscripcion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearSuscripcionComponent implements CanComponentDeactivate {
  private readonly router = inject(Router);
  private readonly suscripcionService = inject(SuscripcionService);
  private readonly toastService = inject(ToastService);

  readonly formComponent = viewChild(NewSubscriptionFormComponent);

  /** ID del grupo desde Router Input Binding (Angular 21) */
  readonly id = input.required<string>();

  canDeactivate(): boolean {
    return this.formComponent()?.canDeactivate() ?? true;
  }

  /**
   * ID del grupo parseado como número.
   * Redirige al dashboard si el ID no es válido.
   */
  protected readonly grupoId = computed(() => {
    const numId = Number(this.id());
    if (!numId || isNaN(numId)) {
      this.router.navigate(['/dashboard']);
      return null;
    }
    return numId;
  });

  protected onSubmitted(data: NewSubscriptionFormValue): void {
    const grupoId = this.grupoId();
    if (!grupoId) return;

    const request: CreateSuscripcionRequest = {
      idUnidad: grupoId,
      nombreServicio: data.nombre,
      precioTotal: data.precioTotal,
      numPlazasTotal: data.plazas,
      periodicidad: data.periodicidad as Periodicidad,
      fechaInicio: new Date().toISOString().split('T')[0],
      anfitrionOcupaPlaza: true,
      credencialUsuario: data.credencialUsuario,
      credencialPassword: data.credencialPassword,
    };

    this.suscripcionService.crearSuscripcion(request).subscribe({
      next: (response: SuscripcionResponse) => {
        // Marcar formulario como exitosamente guardado (pristine)
        this.formComponent()?.markAsSuccessful();
        this.toastService.show('success', 'Suscripción creada exitosamente');
        // Navegar con la suscripción en el state para actualización optimista
        this.router.navigate(['/grupos', grupoId], {
          replaceUrl: true,
          state: { nuevaSuscripcion: response },
        });
      },
      error: (error) => {
        const msg = error.error?.message || 'Error al crear la suscripción';
        this.toastService.show('error', msg);
        this.formComponent()?.setError(msg);
      },
    });
  }

  protected onCancelled(): void {
    const grupoId = this.grupoId();
    if (grupoId) {
      this.router.navigate(['/grupos', grupoId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
