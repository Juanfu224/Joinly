import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NewSubscriptionFormComponent,
  type NewSubscriptionFormValue,
} from '../../components/shared';
import { SuscripcionService, ToastService } from '../../services';
import type { CreateSuscripcionRequest, Periodicidad } from '../../models';

/**
 * Página para crear una nueva suscripción dentro de un grupo.
 *
 * Obtiene el ID del grupo desde la ruta y permite crear suscripciones
 * con datos básicos y credenciales opcionales.
 *
 * @usageNotes
 * Requiere autenticación. Protegida por authGuard.
 * Ruta: /grupos/:id/crear-suscripcion
 */
@Component({
  selector: 'app-crear-suscripcion',
  standalone: true,
  imports: [NewSubscriptionFormComponent],
  templateUrl: './crear-suscripcion.html',
  styleUrl: './crear-suscripcion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearSuscripcionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly suscripcionService = inject(SuscripcionService);
  private readonly toastService = inject(ToastService);

  readonly formComponent = viewChild(NewSubscriptionFormComponent);
  protected readonly grupoId = signal<number | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.grupoId.set(id);
  }

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
      credencialUsuario: data.credencialUsuario,
      credencialPassword: data.credencialPassword,
    };

    this.suscripcionService.crearSuscripcion(request).subscribe({
      next: () => {
        this.toastService.show('success', 'Suscripción creada exitosamente');
        this.router.navigate(['/grupos', grupoId]);
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
