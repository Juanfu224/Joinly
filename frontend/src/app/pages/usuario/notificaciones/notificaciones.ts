import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonComponent,
  CardComponent,
  FormCheckboxComponent,
  IconComponent,
  SpinnerOverlayComponent,
} from '../../../components/shared';
import type { IconName } from '../../../components/shared/icon/icon-paths';
import type { PreferenciasNotificacion } from '../../../models';
import { AuthService, ToastService, UsuarioService } from '../../../services';

interface NotificationOption {
  key: 'notifSolicitudes' | 'notifPagos' | 'notifRecordatorios' | 'notifNovedades';
  icon: IconName;
  title: string;
  description: string;
}

/**
 * Página de configuración de notificaciones del usuario.
 * Permite gestionar preferencias de notificaciones por email.
 *
 * @route /usuario/notificaciones
 */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    FormCheckboxComponent,
    IconComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionesComponent implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #usuarioService = inject(UsuarioService);
  readonly #toastService = inject(ToastService);
  readonly #fb = inject(FormBuilder);

  protected readonly usuario = this.#authService.currentUser;
  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly hasChanges = signal(false);

  #initialValues: PreferenciasNotificacion | null = null;

  protected readonly preferencesForm = this.#fb.nonNullable.group({
    notifSolicitudes: [true],
    notifPagos: [true],
    notifRecordatorios: [true],
    notifNovedades: [false],
  });

  protected readonly canSave = computed(() => this.hasChanges() && !this.isSaving() && !this.isLoading());

  protected readonly notificationOptions: NotificationOption[] = [
    {
      key: 'notifSolicitudes',
      icon: 'users',
      title: 'Solicitudes de unión',
      description: 'Cuando alguien solicita unirse a tu grupo o suscripción',
    },
    {
      key: 'notifPagos',
      icon: 'credit-card',
      title: 'Pagos y transacciones',
      description: 'Confirmaciones de pago, reembolsos y movimientos de saldo',
    },
    {
      key: 'notifRecordatorios',
      icon: 'calendar',
      title: 'Recordatorios',
      description: 'Próximas renovaciones de suscripciones y fechas importantes',
    },
    {
      key: 'notifNovedades',
      icon: 'megaphone',
      title: 'Novedades de Joinly',
      description: 'Nuevas funcionalidades, mejoras y actualizaciones de la plataforma',
    },
  ];

  ngOnInit(): void {
    this.#cargarPreferencias();
    this.#setupFormTracking();
  }

  #setupFormTracking(): void {
    this.preferencesForm.valueChanges.subscribe(() => {
      if (!this.#initialValues) return;

      const current = this.preferencesForm.getRawValue();
      const changed = Object.keys(current).some(
        (key) => current[key as keyof typeof current] !== this.#initialValues![key as keyof PreferenciasNotificacion]
      );
      this.hasChanges.set(changed);
    });
  }

  #cargarPreferencias(): void {
    const user = this.usuario();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.#usuarioService.obtenerPreferenciasNotificacion(user.id).subscribe({
      next: (preferencias) => {
        this.#initialValues = { ...preferencias };
        this.preferencesForm.patchValue(preferencias);
        this.hasChanges.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.#toastService.error('Error al cargar las preferencias de notificación');
        this.isLoading.set(false);
      },
    });
  }

  protected onSave(): void {
    const user = this.usuario();
    if (!user || this.isSaving() || !this.hasChanges()) return;

    this.isSaving.set(true);
    const preferencias = this.preferencesForm.getRawValue();

    this.#usuarioService.actualizarPreferenciasNotificacion(user.id, preferencias).subscribe({
      next: (updated) => {
        this.#initialValues = { ...updated };
        this.hasChanges.set(false);
        this.#toastService.success('Preferencias de notificación actualizadas');
        this.isSaving.set(false);
      },
      error: () => {
        this.#toastService.error('Error al actualizar las preferencias');
        this.isSaving.set(false);
      },
    });
  }

  protected onReset(): void {
    if (this.#initialValues) {
      this.preferencesForm.patchValue(this.#initialValues);
      this.hasChanges.set(false);
    }
  }

  protected onToggleAll(enabled: boolean): void {
    this.preferencesForm.patchValue({
      notifSolicitudes: enabled,
      notifPagos: enabled,
      notifRecordatorios: enabled,
      notifNovedades: enabled,
    });
  }
}
