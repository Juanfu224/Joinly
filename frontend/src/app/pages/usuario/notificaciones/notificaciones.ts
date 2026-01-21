import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  CardComponent,
  ButtonComponent,
  IconComponent,
  FormCheckboxComponent,
  SpinnerOverlayComponent,
} from '../../../components/shared';
import type { IconName } from '../../../components/shared/icon/icon-paths';
import { AuthService, UsuarioService, ToastService } from '../../../services';
import type { PreferenciasNotificacion } from '../../../models';

interface NotificationOption {
  key: 'notifSolicitudes' | 'notifPagos' | 'notifRecordatorios' | 'notifNovedades';
  icon: IconName;
  title: string;
  description: string;
}

/**
 * Página de configuración de notificaciones del usuario.
 *
 * Permite al usuario gestionar sus preferencias de notificaciones
 * por email para diferentes tipos de eventos de la plataforma.
 *
 * @usageNotes
 * Ruta: /usuario/notificaciones
 */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    IconComponent,
    FormCheckboxComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionesComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly usuario = this.authService.currentUser;
  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly hasChanges = signal(false);
  private initialValues: PreferenciasNotificacion | null = null;

  protected readonly preferencesForm = this.fb.nonNullable.group({
    notifSolicitudes: [true],
    notifPagos: [true],
    notifRecordatorios: [true],
    notifNovedades: [false],
  });

  protected readonly canSave = computed(
    () => this.hasChanges() && !this.isSaving() && !this.isLoading()
  );

  /**
   * Opciones de notificación con sus descripciones.
   * Se utilizan para generar la UI de forma dinámica.
   */
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
    this.cargarPreferencias();
    this.setupFormTracking();
  }

  private setupFormTracking(): void {
    this.preferencesForm.valueChanges.subscribe(() => {
      if (this.initialValues) {
        const current = this.preferencesForm.getRawValue();
        const changed =
          current.notifSolicitudes !== this.initialValues.notifSolicitudes ||
          current.notifPagos !== this.initialValues.notifPagos ||
          current.notifRecordatorios !== this.initialValues.notifRecordatorios ||
          current.notifNovedades !== this.initialValues.notifNovedades;
        this.hasChanges.set(changed);
      }
    });
  }

  private cargarPreferencias(): void {
    const user = this.usuario();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.usuarioService.obtenerPreferenciasNotificacion(user.id).subscribe({
      next: (preferencias) => {
        this.initialValues = { ...preferencias };
        this.preferencesForm.patchValue(preferencias);
        this.hasChanges.set(false);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando preferencias:', error);
        this.toastService.error('Error al cargar las preferencias de notificación');
        this.isLoading.set(false);
      },
    });
  }

  protected onSave(): void {
    const user = this.usuario();
    if (!user || this.isSaving() || !this.hasChanges()) return;

    this.isSaving.set(true);
    const preferencias = this.preferencesForm.getRawValue();

    this.usuarioService
      .actualizarPreferenciasNotificacion(user.id, preferencias)
      .subscribe({
        next: (updated) => {
          this.initialValues = { ...updated };
          this.hasChanges.set(false);
          this.toastService.success('Preferencias de notificación actualizadas');
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error actualizando preferencias:', error);
          this.toastService.error('Error al actualizar las preferencias');
          this.isSaving.set(false);
        },
      });
  }

  protected onReset(): void {
    if (this.initialValues) {
      this.preferencesForm.patchValue(this.initialValues);
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
